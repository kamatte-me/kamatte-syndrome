/// <reference path="./virtual.d.ts" />

import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import { imagetools } from 'vite-imagetools';
import { scanContentImageManifest } from './scanContentImageManifest.ts';
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
  createEmptyContentImagesVirtualModule,
  isPathInside,
  parseContentImagesVirtualModuleRequest,
  type ResolvedContentImagesVirtualModule,
  resolveContentImagesSourceDirectory,
  resolveContentImagesVirtualModule,
} from './virtualContentImages.ts';

export type {
  ContentImageEntry,
  ContentImageManifest,
  ContentImageVariant,
} from './types.ts';

export type ContentImagesPluginOptions = {
  cacheDirectory: string;
  enabled?: boolean;
};

export function contentImages({
  cacheDirectory,
  enabled = true,
}: ContentImagesPluginOptions): Plugin[] {
  let devServer: ViteDevServer | undefined;
  let rootDirectory = process.cwd();
  let invalidationTimer: ReturnType<typeof setTimeout> | undefined;
  const pendingInvalidationIds = new Set<string>();
  const manifestPromises = new Map<string, Promise<ContentImageManifest>>();
  const resolvedContentImageModules = new Map<
    string,
    ResolvedContentImageVirtualModule
  >();
  const resolvedContentImagesModules = new Map<
    string,
    ResolvedContentImagesVirtualModule
  >();

  const getManifest = (
    contentImagesModule: ResolvedContentImagesVirtualModule,
  ) => {
    const cacheKey = createManifestCacheKey(contentImagesModule);
    const cachedManifest = manifestPromises.get(cacheKey);
    if (cachedManifest) {
      return cachedManifest;
    }

    const manifest = scanContentImageManifest({
      publicPath: contentImagesModule.base,
      sourceDirectory: contentImagesModule.sourceDirectory,
    }).catch((error: unknown) => {
      manifestPromises.delete(cacheKey);
      throw error;
    });
    manifestPromises.set(cacheKey, manifest);
    return manifest;
  };

  const handleSourceChange = (filePath: string) => {
    const affectedModules = [...resolvedContentImagesModules.values()].filter(
      (contentImagesModule) =>
        isPathInside(contentImagesModule.sourceDirectory, filePath) ||
        isPathInside(contentImagesModule.watchDirectory, filePath),
    );
    if (affectedModules.length === 0) {
      return;
    }

    for (const contentImagesModule of affectedModules) {
      manifestPromises.delete(createManifestCacheKey(contentImagesModule));
      pendingInvalidationIds.add(contentImagesModule.id);
    }

    clearTimeout(invalidationTimer);
    invalidationTimer = setTimeout(() => {
      const invalidationIds = [...pendingInvalidationIds];
      pendingInvalidationIds.clear();

      for (const environment of Object.values(devServer?.environments ?? {})) {
        for (const id of invalidationIds) {
          const module = environment.moduleGraph.getModuleById(id);
          if (module) {
            environment.moduleGraph.invalidateModule(module);
          }
        }
      }
      devServer?.ws.send({ type: 'full-reload' });
    }, 100);
  };

  const plugin: Plugin = {
    name: 'content-images',
    enforce: 'pre',
    sharedDuringBuild: true,
    configResolved(config) {
      rootDirectory = config.root;
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

      const contentImagesRequest = parseContentImagesVirtualModuleRequest(id);
      if (contentImagesRequest) {
        const sourceDirectory =
          contentImagesRequest.src.startsWith('/') ||
          contentImagesRequest.src.startsWith('.')
            ? resolveContentImagesSourceDirectory({
                importer,
                rootDirectory,
                src: contentImagesRequest.src,
              })
            : await resolveAliasedSourceDirectory({
                importer,
                resolve: (source, sourceImporter) =>
                  this.resolve(source, sourceImporter, { skipSelf: true }),
                src: contentImagesRequest.src,
              });
        await assertSourceDirectory(sourceDirectory, contentImagesRequest.src);
        const watchDirectory = normalizeSourcePath(
          await realpath(sourceDirectory),
        );
        const resolvedModule = resolveContentImagesVirtualModule({
          ...contentImagesRequest,
          sourceDirectory,
          watchDirectory,
        });
        resolvedContentImagesModules.set(resolvedModule.id, resolvedModule);
        devServer?.watcher.add([sourceDirectory, watchDirectory]);
        return resolvedModule.id;
      }
    },
    async load(id) {
      const contentImageModule = resolvedContentImageModules.get(id);
      if (contentImageModule) {
        this.addWatchFile(contentImageModule.sourcePath);
        const metadata = await sharp(contentImageModule.sourcePath).metadata();
        const width = metadata.autoOrient.width;
        const height = metadata.autoOrient.height;
        if (!width || !height) {
          throw new Error(
            `Image dimensions are unavailable: ${contentImageModule.src}`,
          );
        }
        if (!enabled) {
          return createUnoptimizedContentImageVirtualModule({
            height,
            sourcePath: contentImageModule.sourcePath,
            width,
          });
        }
        return createContentImageVirtualModule({
          ...contentImageModule,
          naturalWidth: width,
        });
      }

      const contentImagesModule = resolvedContentImagesModules.get(id);
      if (contentImagesModule) {
        if (!enabled) {
          return createEmptyContentImagesVirtualModule();
        }

        const manifest = await getManifest(contentImagesModule);
        const publicPathPrefix = `${contentImagesModule.base}/`;
        for (const publicUrl of Object.keys(manifest)) {
          this.addWatchFile(
            path.join(
              contentImagesModule.sourceDirectory,
              publicUrl.slice(publicPathPrefix.length),
            ),
          );
          this.addWatchFile(
            path.join(
              contentImagesModule.watchDirectory,
              publicUrl.slice(publicPathPrefix.length),
            ),
          );
        }
        return createContentImagesVirtualModule({
          base: contentImagesModule.base,
          manifest,
          sourceDirectory: contentImagesModule.sourceDirectory,
          widths: contentImagesModule.widths,
        });
      }
    },
    configureServer(server) {
      devServer = server;
      if (!enabled) {
        return;
      }

      server.watcher.add(
        [...resolvedContentImagesModules.values()].flatMap(
          (contentImagesModule) => [
            contentImagesModule.sourceDirectory,
            contentImagesModule.watchDirectory,
          ],
        ),
      );
      server.watcher.on('add', handleSourceChange);
      server.watcher.on('change', handleSourceChange);
      server.watcher.on('unlink', handleSourceChange);

      const cleanup = () => {
        clearTimeout(invalidationTimer);
        server.watcher.off('add', handleSourceChange);
        server.watcher.off('change', handleSourceChange);
        server.watcher.off('unlink', handleSourceChange);
      };
      server.httpServer?.once('close', cleanup);
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
            include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
          }),
        ]
      : []),
  ];
}

function createManifestCacheKey({
  base,
  sourceDirectory,
}: Pick<ResolvedContentImagesVirtualModule, 'base' | 'sourceDirectory'>) {
  return `${sourceDirectory}\0${base}`;
}

async function assertSourceDirectory(sourceDirectory: string, src: string) {
  try {
    const sourceStats = await stat(sourceDirectory);
    if (sourceStats.isDirectory()) {
      return;
    }
  } catch (error) {
    throw new Error(`Unable to read content image directory: ${src}`, {
      cause: error,
    });
  }

  throw new Error(`Content image source is not a directory: ${src}`);
}

function normalizeSourcePath(sourcePath: string) {
  return sourcePath.split(path.sep).join('/');
}

async function resolveAliasedSourceDirectory({
  importer,
  resolve,
  src,
}: Readonly<{
  importer: string | undefined;
  resolve: (
    source: string,
    importer: string,
  ) => Promise<{ external?: 'absolute' | boolean; id: string } | null>;
  src: string;
}>) {
  if (!importer || importer.startsWith('\0')) {
    throw new Error(
      `${src} must be imported from an application module to resolve its Vite alias`,
    );
  }

  const resolvedSource = await resolve(src, importer);
  if (!resolvedSource || resolvedSource.external) {
    throw new Error(`Unable to resolve content image directory: ${src}`);
  }

  const sourceDirectory = resolvedSource.id.split(/[?#]/, 1)[0];
  if (!sourceDirectory || !path.isAbsolute(sourceDirectory)) {
    throw new Error(
      `Content image directory alias must resolve to an absolute path: ${src}`,
    );
  }

  return normalizeSourcePath(sourceDirectory);
}
