import {
  type FSWatcher,
  mkdtempSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import {
  imagetools,
  resolveConfigs as resolveImagetoolsConfigs,
} from 'vite-imagetools';
import { scanImageVariantManifest } from './image/metadata.ts';
import { imageTransformQueryParameter } from './image/transform.ts';
import type { ImageVariantManifest } from './types.ts';
import {
  createReactImageVirtualModule,
  createUnoptimizedReactImageVirtualModule,
  parseReactImageVirtualModuleRequest,
  type ResolvedReactImageVirtualModule,
  resolveReactImageVirtualModule,
} from './virtual/reactImage.ts';
import {
  createEmptyReactImageCollectionVirtualModule,
  createReactImageCollectionVirtualModule,
  isPathInside,
  parseReactImageCollectionVirtualModuleRequest,
  type ResolvedReactImageCollectionVirtualModule,
  resolveReactImageCollectionSourceDirectory,
  resolveReactImageCollectionVirtualModule,
} from './virtual/reactImageCollection.ts';

export type OptimizedResponsiveImagePluginOptions = {
  cacheDirectory: string;
  enabled?: boolean;
};

export function optimizedResponsiveImage({
  cacheDirectory,
  enabled = true,
}: OptimizedResponsiveImagePluginOptions): Plugin[] {
  let devServer: ViteDevServer | undefined;
  let isBuild = false;
  let isWatchBuild = false;
  let rootDirectory = process.cwd();
  let invalidationTimer: ReturnType<typeof setTimeout> | undefined;
  let buildWatchTimer: ReturnType<typeof setTimeout> | undefined;
  let buildWatchMarkerVersion = 0;
  let buildWatchError: Error | undefined;
  let buildWatchMarker:
    | Readonly<{ directory: string; filePath: string }>
    | undefined;
  const pendingInvalidationIds = new Set<string>();
  const buildWatchDirectories = new Map<
    string,
    Readonly<{ cacheKeys: Set<string>; watcher: FSWatcher }>
  >();
  const manifestPromises = new Map<string, Promise<ImageVariantManifest>>();
  const resolvedImageVariantModules = new Map<
    string,
    ResolvedReactImageVirtualModule
  >();
  const resolvedImageVariantsModules = new Map<
    string,
    ResolvedReactImageCollectionVirtualModule
  >();

  const getManifest = (
    imageVariantsModule: ResolvedReactImageCollectionVirtualModule,
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

  const getBuildWatchMarker = () => {
    buildWatchMarker ??= (() => {
      const directory = mkdtempSync(
        path.join(
          tmpdir(),
          'vite-plugin-react-optimized-responsive-image-watch-',
        ),
      );
      const filePath = path.join(directory, 'invalidate');
      writeFileSync(filePath, '0');
      return { directory, filePath };
    })();
    return buildWatchMarker;
  };

  const scheduleBuildWatch = (cacheKeys: ReadonlySet<string>) => {
    for (const cacheKey of cacheKeys) {
      manifestPromises.delete(cacheKey);
    }
    clearTimeout(buildWatchTimer);
    buildWatchTimer = setTimeout(() => {
      try {
        const marker = getBuildWatchMarker();
        buildWatchMarkerVersion += 1;
        writeFileSync(marker.filePath, String(buildWatchMarkerVersion));
      } catch (error) {
        buildWatchError = new Error(
          'Unable to invalidate the image collection watch build',
          { cause: error },
        );
      }
    }, 100);
  };

  const watchBuildDirectory = (
    directory: string,
    imageVariantsModule: ResolvedReactImageCollectionVirtualModule,
  ) => {
    const normalizedDirectory = normalizeSourcePath(directory);
    const cacheKey = createManifestCacheKey(imageVariantsModule);
    const existingWatch = buildWatchDirectories.get(normalizedDirectory);
    if (existingWatch) {
      existingWatch.cacheKeys.add(cacheKey);
      return;
    }

    const cacheKeys = new Set([cacheKey]);
    const watcher = watch(normalizedDirectory, { recursive: true }, (event) => {
      if (event === 'rename') {
        scheduleBuildWatch(cacheKeys);
      }
    });
    watcher.on('error', (error) => {
      buildWatchError = new Error(
        `Unable to watch image collection directory: ${normalizedDirectory}`,
        { cause: error },
      );
      scheduleBuildWatch(cacheKeys);
    });
    buildWatchDirectories.set(normalizedDirectory, { cacheKeys, watcher });
  };

  const plugin: Plugin = {
    name: 'react-optimized-responsive-image',
    enforce: 'pre',
    sharedDuringBuild: true,
    configResolved(config) {
      isBuild = config.command === 'build';
      isWatchBuild = isBuild && config.build.watch != null;
      rootDirectory = config.root;
    },
    async resolveId(id, importer) {
      const imageVariantRequest = parseReactImageVirtualModuleRequest(id);
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
        const resolvedModule = resolveReactImageVirtualModule({
          ...imageVariantRequest,
          sourcePath: resolvedSource.id,
        });
        resolvedImageVariantModules.set(resolvedModule.id, resolvedModule);
        return resolvedModule.id;
      }

      const imageVariantsRequest =
        parseReactImageCollectionVirtualModuleRequest(id);
      if (imageVariantsRequest) {
        const sourceDirectory =
          imageVariantsRequest.src.startsWith('/') ||
          imageVariantsRequest.src.startsWith('.')
            ? resolveReactImageCollectionSourceDirectory({
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
        const resolvedModule = resolveReactImageCollectionVirtualModule({
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
          return createUnoptimizedReactImageVirtualModule({
            height,
            sourcePath: imageVariantModule.sourcePath,
            width,
          });
        }
        return createReactImageVirtualModule({
          ...imageVariantModule,
          naturalHeight: height,
          naturalWidth: width,
        });
      }

      const imageVariantsModule = resolvedImageVariantsModules.get(id);
      if (imageVariantsModule) {
        if (!enabled) {
          return createEmptyReactImageCollectionVirtualModule();
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
        let buildWatchMarkerPath: string | undefined;
        if (isWatchBuild) {
          if (buildWatchError) {
            throw buildWatchError;
          }
          buildWatchMarkerPath = getBuildWatchMarker().filePath;
          watchBuildDirectory(
            imageVariantsModule.sourceDirectory,
            imageVariantsModule,
          );
          if (
            imageVariantsModule.watchDirectory !==
            imageVariantsModule.sourceDirectory
          ) {
            watchBuildDirectory(
              imageVariantsModule.watchDirectory,
              imageVariantsModule,
            );
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
        const moduleCode = createReactImageCollectionVirtualModule({
          base: imageVariantsModule.base,
          manifest,
          sourceDirectory: imageVariantsModule.sourceDirectory,
          widths: imageVariantsModule.widths,
        });
        return buildWatchMarkerPath
          ? `import ${JSON.stringify(`${buildWatchMarkerPath}?raw`)};\n${moduleCode}`
          : moduleCode;
      }
    },
    watchChange(id) {
      invalidateAffectedManifests(normalizeSourcePath(id));
    },
    closeWatcher() {
      clearTimeout(buildWatchTimer);
      for (const { watcher } of buildWatchDirectories.values()) {
        watcher.close();
      }
      buildWatchDirectories.clear();
      if (buildWatchMarker) {
        rmSync(buildWatchMarker.directory, { force: true, recursive: true });
        buildWatchMarker = undefined;
      }
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
}: Pick<
  ResolvedReactImageCollectionVirtualModule,
  'base' | 'sourceDirectory'
>) {
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
