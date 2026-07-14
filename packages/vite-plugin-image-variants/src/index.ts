/// <reference path="./virtual.d.ts" />

import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import {
  imagetools,
  resolveConfigs as resolveImagetoolsConfigs,
} from 'vite-imagetools';
import { imageTransformQueryParameter } from './imageTransform.ts';
import { scanImageVariantManifest } from './scanImageVariantManifest.ts';
import type { ImageVariantManifest } from './types.ts';
import {
  createImageVariantVirtualModule,
  createUnoptimizedImageVariantVirtualModule,
  parseImageVariantVirtualModuleRequest,
  type ResolvedImageVariantVirtualModule,
  resolveImageVariantVirtualModule,
} from './virtualImageVariant.ts';
import {
  createEmptyImageVariantsVirtualModule,
  createImageVariantsVirtualModule,
  isPathInside,
  parseImageVariantsVirtualModuleRequest,
  type ResolvedImageVariantsVirtualModule,
  resolveImageVariantsSourceDirectory,
  resolveImageVariantsVirtualModule,
} from './virtualImageVariants.ts';

export type {
  ImageVariant,
  ImageVariantEntry,
  ImageVariantManifest,
} from './types.ts';

export type ImageVariantsPluginOptions = {
  cacheDirectory: string;
  enabled?: boolean;
};

export function imageVariants({
  cacheDirectory,
  enabled = true,
}: ImageVariantsPluginOptions): Plugin[] {
  let devServer: ViteDevServer | undefined;
  let isBuild = false;
  let rootDirectory = process.cwd();
  let invalidationTimer: ReturnType<typeof setTimeout> | undefined;
  const pendingInvalidationIds = new Set<string>();
  const manifestPromises = new Map<string, Promise<ImageVariantManifest>>();
  const resolvedImageVariantModules = new Map<
    string,
    ResolvedImageVariantVirtualModule
  >();
  const resolvedImageVariantsModules = new Map<
    string,
    ResolvedImageVariantsVirtualModule
  >();

  const getManifest = (
    imageVariantsModule: ResolvedImageVariantsVirtualModule,
  ) => {
    const cacheKey = createManifestCacheKey(imageVariantsModule);
    const cachedManifest = manifestPromises.get(cacheKey);
    if (cachedManifest) {
      return cachedManifest;
    }

    const manifest = scanImageVariantManifest({
      publicPath: imageVariantsModule.base,
      sourceDirectory: imageVariantsModule.sourceDirectory,
    }).catch((error: unknown) => {
      manifestPromises.delete(cacheKey);
      throw error;
    });
    manifestPromises.set(cacheKey, manifest);
    return manifest;
  };

  const invalidateAffectedManifests = (filePath: string) => {
    const affectedModules = [...resolvedImageVariantsModules.values()].filter(
      (imageVariantsModule) =>
        isPathInside(imageVariantsModule.sourceDirectory, filePath) ||
        isPathInside(imageVariantsModule.watchDirectory, filePath),
    );

    for (const imageVariantsModule of affectedModules) {
      manifestPromises.delete(createManifestCacheKey(imageVariantsModule));
    }

    return affectedModules.map((imageVariantsModule) => imageVariantsModule.id);
  };

  const handleSourceChange = (filePath: string) => {
    const affectedModuleIds = invalidateAffectedManifests(
      normalizeSourcePath(filePath),
    );
    if (affectedModuleIds.length === 0) {
      return;
    }

    for (const id of affectedModuleIds) {
      pendingInvalidationIds.add(id);
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
    name: 'image-variants',
    enforce: 'pre',
    sharedDuringBuild: true,
    configResolved(config) {
      isBuild = config.command === 'build';
      rootDirectory = config.root;
    },
    async resolveId(id, importer) {
      const imageVariantRequest = parseImageVariantVirtualModuleRequest(id);
      if (imageVariantRequest) {
        if (!importer) {
          throw new Error(
            `${imageVariantRequest.src} must be imported from an application module`,
          );
        }
        const resolvedSource = await this.resolve(
          imageVariantRequest.src,
          importer,
          { skipSelf: true },
        );
        if (!resolvedSource || resolvedSource.external) {
          throw new Error(
            `Unable to resolve image source: ${imageVariantRequest.src}`,
          );
        }
        const resolvedModule = resolveImageVariantVirtualModule({
          ...imageVariantRequest,
          sourcePath: resolvedSource.id,
        });
        resolvedImageVariantModules.set(resolvedModule.id, resolvedModule);
        return resolvedModule.id;
      }

      const imageVariantsRequest = parseImageVariantsVirtualModuleRequest(id);
      if (imageVariantsRequest) {
        const sourceDirectory =
          imageVariantsRequest.src.startsWith('/') ||
          imageVariantsRequest.src.startsWith('.')
            ? resolveImageVariantsSourceDirectory({
                importer,
                rootDirectory,
                src: imageVariantsRequest.src,
              })
            : await resolveAliasedSourceDirectory({
                importer,
                resolve: (source, sourceImporter) =>
                  this.resolve(source, sourceImporter, { skipSelf: true }),
                src: imageVariantsRequest.src,
              });
        await assertSourceDirectory(sourceDirectory, imageVariantsRequest.src);
        const watchDirectory = normalizeSourcePath(
          await realpath(sourceDirectory),
        );
        const resolvedModule = resolveImageVariantsVirtualModule({
          ...imageVariantsRequest,
          sourceDirectory,
          watchDirectory,
        });
        resolvedImageVariantsModules.set(resolvedModule.id, resolvedModule);
        devServer?.watcher.add([sourceDirectory, watchDirectory]);
        return resolvedModule.id;
      }
    },
    async load(id) {
      const imageVariantModule = resolvedImageVariantModules.get(id);
      if (imageVariantModule) {
        this.addWatchFile(imageVariantModule.sourcePath);
        const metadata = await sharp(imageVariantModule.sourcePath).metadata();
        const width = metadata.autoOrient.width;
        const height = metadata.autoOrient.height;
        if (!width || !height) {
          throw new Error(
            `Image dimensions are unavailable: ${imageVariantModule.src}`,
          );
        }
        if (!enabled) {
          return createUnoptimizedImageVariantVirtualModule({
            height,
            sourcePath: imageVariantModule.sourcePath,
            width,
          });
        }
        return createImageVariantVirtualModule({
          ...imageVariantModule,
          naturalHeight: height,
          naturalWidth: width,
        });
      }

      const imageVariantsModule = resolvedImageVariantsModules.get(id);
      if (imageVariantsModule) {
        if (!enabled) {
          return createEmptyImageVariantsVirtualModule();
        }
        if (isBuild) {
          this.addWatchFile(imageVariantsModule.sourceDirectory);
          if (
            imageVariantsModule.watchDirectory !==
            imageVariantsModule.sourceDirectory
          ) {
            this.addWatchFile(imageVariantsModule.watchDirectory);
          }
        }

        const manifest = await getManifest(imageVariantsModule);
        const publicPathPrefix = `${imageVariantsModule.base}/`;
        for (const publicUrl of Object.keys(manifest)) {
          this.addWatchFile(
            path.join(
              imageVariantsModule.sourceDirectory,
              publicUrl.slice(publicPathPrefix.length),
            ),
          );
          this.addWatchFile(
            path.join(
              imageVariantsModule.watchDirectory,
              publicUrl.slice(publicPathPrefix.length),
            ),
          );
        }
        return createImageVariantsVirtualModule({
          base: imageVariantsModule.base,
          manifest,
          sourceDirectory: imageVariantsModule.sourceDirectory,
          widths: imageVariantsModule.widths,
        });
      }
    },
    watchChange(id) {
      invalidateAffectedManifests(normalizeSourcePath(id));
    },
    configureServer(server) {
      devServer = server;
      if (!enabled) {
        return;
      }

      server.watcher.add(
        [...resolvedImageVariantsModules.values()].flatMap(
          (imageVariantsModule) => [
            imageVariantsModule.sourceDirectory,
            imageVariantsModule.watchDirectory,
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
            include: new RegExp(
              `^[^?]+\\.(?:avif|gif|heif|jpeg|jpg|png|tiff|webp)\\?${imageTransformQueryParameter}=true(?:&.*)?$`,
              'i',
            ),
            resolveConfigs: (parameters, outputFormats) =>
              resolveImagetoolsConfigs(
                parameters.filter(
                  ([name]) => name !== imageTransformQueryParameter,
                ),
                outputFormats,
              ),
          }),
        ]
      : []),
  ];
}

function createManifestCacheKey({
  base,
  sourceDirectory,
}: Pick<ResolvedImageVariantsVirtualModule, 'base' | 'sourceDirectory'>) {
  return `${sourceDirectory}\0${base}`;
}

async function assertSourceDirectory(sourceDirectory: string, src: string) {
  try {
    const sourceStats = await stat(sourceDirectory);
    if (sourceStats.isDirectory()) {
      return;
    }
  } catch (error) {
    throw new Error(`Unable to read image source directory: ${src}`, {
      cause: error,
    });
  }

  throw new Error(`Image source is not a directory: ${src}`);
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
    throw new Error(`Unable to resolve image source directory: ${src}`);
  }

  const sourceDirectory = resolvedSource.id.split(/[?#]/, 1)[0];
  if (!sourceDirectory || !path.isAbsolute(sourceDirectory)) {
    throw new Error(
      `Image source directory alias must resolve to an absolute path: ${src}`,
    );
  }

  return normalizeSourcePath(sourceDirectory);
}
