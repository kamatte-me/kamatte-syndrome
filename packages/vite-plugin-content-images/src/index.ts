/// <reference path="./virtual.d.ts" />

import path from 'node:path';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import { imagetools } from 'vite-imagetools';
import {
  type GenerateContentImagesOptions,
  generateContentImages,
} from './generateContentImages.ts';
import type { ContentImageManifest } from './types.ts';
import {
  createContentImageVirtualModule,
  createUnoptimizedContentImageVirtualModule,
  parseContentImageVirtualModuleRequest,
  type ResolvedContentImageVirtualModule,
  resolveContentImageVirtualModule,
} from './virtualContentImage.ts';
import {
  createContentImagesVirtualModule,
  isPathInside,
  parseContentImagesVirtualModuleRequest,
  resolveContentImageSource,
  resolveContentImagesVirtualModuleId,
} from './virtualContentImages.ts';

export type {
  ContentImageEntry,
  ContentImageManifest,
  ContentImageVariant,
} from './types.ts';

export type ContentImageSourceOptions = Omit<
  GenerateContentImagesOptions,
  'cacheDirectory'
> & {
  id: string;
};

export type ContentImagesPluginOptions = {
  cacheDirectory: string;
  enabled?: boolean;
  sources?: readonly ContentImageSourceOptions[];
};

export function contentImages({
  cacheDirectory,
  enabled = true,
  sources: sourceOptions = [],
}: ContentImagesPluginOptions): Plugin[] {
  const sources = validateSources(cacheDirectory, sourceOptions);
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const sourceDirectories = new Map(
    sources.map((source) => [source.id, source.sourceDirectory]),
  );
  const manifests = new Map<string, ContentImageManifest>();
  let initialGeneration: Promise<void> | undefined;
  let devServer: ViteDevServer | undefined;
  let regeneration = Promise.resolve();
  let regenerationTimer: ReturnType<typeof setTimeout> | undefined;
  const pendingSourceIds = new Set<string>();
  const resolvedVirtualModuleIds = new Map<string, string>();
  const resolvedContentImageModules = new Map<
    string,
    ResolvedContentImageVirtualModule
  >();

  const regenerate = async (sourceIds: readonly string[]) => {
    await Promise.all(
      sourceIds.map(async (sourceId) => {
        const source = sourcesById.get(sourceId);
        if (!source) {
          return;
        }
        const manifest = enabled
          ? await generateContentImages(source)
          : ({} satisfies ContentImageManifest);
        manifests.set(sourceId, manifest);
      }),
    );
  };

  const queueRegeneration = (sourceIds: readonly string[]) => {
    for (const sourceId of sourceIds) {
      pendingSourceIds.add(sourceId);
    }
    clearTimeout(regenerationTimer);
    regenerationTimer = setTimeout(() => {
      const queuedSourceIds = [...pendingSourceIds];
      pendingSourceIds.clear();
      regeneration = regeneration
        .then(() => regenerate(queuedSourceIds))
        .then(() => {
          for (const environment of Object.values(
            devServer?.environments ?? {},
          )) {
            for (const [id, sourceId] of resolvedVirtualModuleIds) {
              if (!queuedSourceIds.includes(sourceId)) {
                continue;
              }
              const module = environment.moduleGraph.getModuleById(id);
              if (module) {
                environment.moduleGraph.invalidateModule(module);
              }
            }
          }
          devServer?.ws.send({ type: 'full-reload' });
        })
        .catch((error: unknown) => {
          devServer?.config.logger.error(
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          );
        });
    }, 100);
  };

  const handleSourceChange = (filePath: string) => {
    const changedSourceIds = sources
      .filter((source) => isPathInside(source.sourceDirectory, filePath))
      .map((source) => source.id);
    if (changedSourceIds.length > 0) {
      queueRegeneration(changedSourceIds);
    }
  };

  const plugin: Plugin = {
    name: 'content-images',
    enforce: 'pre',
    sharedDuringBuild: true,
    async buildStart() {
      initialGeneration ??= regenerate(sources.map((source) => source.id));
      await initialGeneration;
    },
    async resolveId(id, importer) {
      const contentImageRequest = parseContentImageVirtualModuleRequest(id);
      if (contentImageRequest) {
        if (!importer) {
          throw new Error(
            `${contentImageRequest.src} must be imported from an application module`,
          );
        }
        const resolvedSource = await this.resolve(
          contentImageRequest.src,
          importer,
          { skipSelf: true },
        );
        if (!resolvedSource || resolvedSource.external) {
          throw new Error(
            `Unable to resolve content image: ${contentImageRequest.src}`,
          );
        }
        const resolvedModule = resolveContentImageVirtualModule({
          ...contentImageRequest,
          sourcePath: resolvedSource.id,
        });
        resolvedContentImageModules.set(resolvedModule.id, resolvedModule);
        return resolvedModule.id;
      }

      const sourceId = resolveContentImageSource(id, sourceDirectories);
      if (sourceId) {
        return sourceId;
      }

      const resolvedId = resolveContentImagesVirtualModuleId(id);
      if (resolvedId) {
        const request = parseContentImagesVirtualModuleRequest(resolvedId);
        if (!request || !sourcesById.has(request.sourceId)) {
          throw new Error(
            `Unknown content image source: ${request?.sourceId ?? ''}`,
          );
        }
        resolvedVirtualModuleIds.set(resolvedId, request.sourceId);
        return resolvedId;
      }
    },
    async load(id) {
      const contentImageModule = resolvedContentImageModules.get(id);
      if (contentImageModule) {
        this.addWatchFile(contentImageModule.sourcePath);
        if (!enabled) {
          const metadata = await sharp(
            contentImageModule.sourcePath,
          ).metadata();
          const width = metadata.autoOrient.width;
          const height = metadata.autoOrient.height;
          if (!width || !height) {
            throw new Error(
              `Image dimensions are unavailable: ${contentImageModule.src}`,
            );
          }
          return createUnoptimizedContentImageVirtualModule({
            height,
            sourcePath: contentImageModule.sourcePath,
            width,
          });
        }
        return createContentImageVirtualModule(contentImageModule);
      }

      const request = parseContentImagesVirtualModuleRequest(id);
      if (request) {
        const source = sourcesById.get(request.sourceId);
        if (!source) {
          throw new Error(`Unknown content image source: ${request.sourceId}`);
        }
        return createContentImagesVirtualModule({
          manifest: manifests.get(source.id) ?? {},
          publicPath: source.publicPath,
          sourceId: source.id,
          widths: request.widths,
        });
      }
    },
    configureServer(server) {
      devServer = server;
      if (!enabled) {
        return;
      }

      server.watcher.add(sources.map((source) => source.sourceDirectory));
      server.watcher.on('add', handleSourceChange);
      server.watcher.on('change', handleSourceChange);
      server.watcher.on('unlink', handleSourceChange);

      return () => {
        clearTimeout(regenerationTimer);
        server.watcher.off('add', handleSourceChange);
        server.watcher.off('change', handleSourceChange);
        server.watcher.off('unlink', handleSourceChange);
      };
    },
  };

  return [
    plugin,
    ...(enabled
      ? [
          imagetools({
            cache: {
              dir: path.join(cacheDirectory, 'imagetools'),
            },
          }),
        ]
      : []),
  ];
}

type ResolvedContentImageSource = ContentImageSourceOptions & {
  cacheDirectory: string;
};

function validateSources(
  cacheDirectory: string,
  sources: readonly ContentImageSourceOptions[],
): ResolvedContentImageSource[] {
  const resolvedCacheDirectory = path.resolve(cacheDirectory);
  const resolvedSources = sources.map((source) => ({
    ...source,
    cacheDirectory: path.join(resolvedCacheDirectory, source.id),
    outputDirectory: path.resolve(source.outputDirectory),
    sourceDirectory: path.resolve(source.sourceDirectory),
  }));
  const sourceIds = new Set<string>();
  const publicPaths = new Set<string>();

  for (const source of resolvedSources) {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(source.id)) {
      throw new Error(
        `Content image source id must match [a-z0-9][a-z0-9_-]*: ${source.id}`,
      );
    }
    if (sourceIds.has(source.id)) {
      throw new Error(`Duplicate content image source id: ${source.id}`);
    }
    sourceIds.add(source.id);

    const publicPath = `/${source.publicPath.replace(/^\/+|\/+$/g, '')}`;
    if (publicPath === '/') {
      throw new Error(
        `Content image public path must not be root: ${source.id}`,
      );
    }
    if (publicPaths.has(publicPath)) {
      throw new Error(`Duplicate content image public path: ${publicPath}`);
    }
    publicPaths.add(publicPath);
    source.publicPath = publicPath;

    assertDirectoriesDoNotOverlap(
      source.sourceDirectory,
      source.outputDirectory,
      `Source and output directories must not overlap for ${source.id}`,
    );
    assertDirectoriesDoNotOverlap(
      resolvedCacheDirectory,
      source.sourceDirectory,
      `Cache and source directories must not overlap for ${source.id}`,
    );
    assertDirectoriesDoNotOverlap(
      resolvedCacheDirectory,
      source.outputDirectory,
      `Cache and output directories must not overlap for ${source.id}`,
    );
  }

  for (let index = 0; index < resolvedSources.length; index += 1) {
    for (
      let comparisonIndex = index + 1;
      comparisonIndex < resolvedSources.length;
      comparisonIndex += 1
    ) {
      const source = resolvedSources[index];
      const comparison = resolvedSources[comparisonIndex];
      if (source && comparison) {
        assertDirectoriesDoNotOverlap(
          source.sourceDirectory,
          comparison.sourceDirectory,
          `Source directories must not overlap for ${source.id} and ${comparison.id}`,
        );
        assertDirectoriesDoNotOverlap(
          source.outputDirectory,
          comparison.outputDirectory,
          `Output directories must not overlap for ${source.id} and ${comparison.id}`,
        );
        assertDirectoriesDoNotOverlap(
          source.sourceDirectory,
          comparison.outputDirectory,
          `Source and output directories must not overlap for ${source.id} and ${comparison.id}`,
        );
        assertDirectoriesDoNotOverlap(
          source.outputDirectory,
          comparison.sourceDirectory,
          `Source and output directories must not overlap for ${source.id} and ${comparison.id}`,
        );
      }
    }
  }

  return resolvedSources;
}

function assertDirectoriesDoNotOverlap(
  firstDirectory: string,
  secondDirectory: string,
  message: string,
) {
  if (
    isPathInside(firstDirectory, secondDirectory) ||
    isPathInside(secondDirectory, firstDirectory)
  ) {
    throw new Error(message);
  }
}
