import { createHash } from 'node:crypto';
import {
  type FSWatcher,
  mkdtempSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs';
import { readFile, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createViteAssetUrl,
  getImageDisplayDimensions,
  isPathInside,
  normalizeSourcePath,
  normalizeViteBasePath,
} from '@kamatte-syndrome/image-optimization-core';
import sharp from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import { scanImageVariantManifest } from './image/metadata.ts';
import {
  type GeneratedImageVariants,
  generateImageVariants,
  type ImageVariantFormatOptions,
  resolveImageVariantFormatSettings,
} from './image/transform.ts';
import type { ImageVariantEntry, ImageVariantManifest } from './types.ts';
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
  parseReactImageCollectionVirtualModuleRequest,
  type ResolvedReactImageCollectionVirtualModule,
  resolveManifestSourcePath,
  resolveReactImageCollectionSourceDirectory,
  resolveReactImageCollectionVirtualModule,
} from './virtual/reactImageCollection.ts';

export type OptimizedResponsiveImagePluginOptions = Readonly<{
  /** AVIF compression settings. Quality defaults to 60. */
  avif?: ImageVariantFormatOptions;
  /** Parent directory for persistent generated image assets. */
  cacheDirectory?: string;
  enabled?: boolean;
  /**
   * Generate lossless WebP variants for every image and omit AVIF variants.
   * @default false
   */
  lossless?: boolean;
  /** WebP compression settings. Quality defaults to 80. */
  webp?: ImageVariantFormatOptions;
}>;

const developmentAssetPath = '/@react-optimized-responsive-image/';

type PreparedResponsiveImage = Readonly<{
  source: Buffer;
  sourceExtension: string;
  sourceHash: string;
  sourceHeight: number;
  sourcePath: string;
  sourceWidth: number;
  variants: GeneratedImageVariants;
}>;

type DevelopmentAsset = Readonly<{
  buffer: Buffer;
  contentType: string;
}>;

export function optimizedResponsiveImage({
  avif,
  cacheDirectory,
  enabled = true,
  lossless = false,
  webp,
}: OptimizedResponsiveImagePluginOptions = {}): Plugin[] {
  const formatSettings = resolveImageVariantFormatSettings({ avif, webp });
  const resolvedCacheDirectory = path.resolve(
    cacheDirectory ??
      'node_modules/.cache/vite-plugin-react-optimized-responsive-image',
  );
  const transformedImageCacheDirectory = path.join(
    resolvedCacheDirectory,
    'transforms',
  );
  let devServer: ViteDevServer | undefined;
  let isBuild = false;
  let isWatchBuild = false;
  let rootDirectory = process.cwd();
  let viteBase = '/';
  let invalidationTimer: ReturnType<typeof setTimeout> | undefined;
  let buildWatchTimer: ReturnType<typeof setTimeout> | undefined;
  let buildWatchMarkerVersion = 0;
  let buildWatchError: Error | undefined;
  let buildWatchMarker:
    | Readonly<{ directory: string; filePath: string }>
    | undefined;
  const pendingInvalidationIds = new Set<string>();
  const failedBuildWatchManifestCacheKeys = new Set<string>();
  const buildWatchDirectories = new Map<
    string,
    Readonly<{ cacheKeys: Set<string>; watcher: FSWatcher }>
  >();
  const manifestPromises = new Map<string, Promise<ImageVariantManifest>>();
  const developmentAssets = new Map<string, DevelopmentAsset>();
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
    if (affectedModules.length > 0) {
      developmentAssets.clear();
    }

    return affectedModules.map((imageVariantsModule) => imageVariantsModule.id);
  };

  const handleSourceChange = (filePath: string) => {
    const normalizedFilePath = normalizeSourcePath(filePath);
    const affectedModuleIds = [
      ...invalidateAffectedManifests(normalizedFilePath),
      ...[...resolvedImageVariantModules.values()]
        .filter(
          (imageVariantModule) =>
            normalizeSourcePath(imageVariantModule.sourcePath) ===
            normalizedFilePath,
        )
        .map((imageVariantModule) => imageVariantModule.id),
    ];
    if (affectedModuleIds.length > 0) {
      developmentAssets.clear();
    }
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
        return;
      }

      const failedCacheKeys = new Set(
        [...cacheKeys].filter((key) =>
          failedBuildWatchManifestCacheKeys.has(key),
        ),
      );
      if (failedCacheKeys.size > 0) {
        scheduleBuildWatch(failedCacheKeys);
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
      viteBase = normalizeViteBasePath(config.base);
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
        const image = await prepareResponsiveImage({
          cacheDirectory: transformedImageCacheDirectory,
          enabled,
          formatSettings,
          lossless: lossless || imageVariantModule.lossless,
          sourcePath: imageVariantModule.sourcePath,
          widths: imageVariantModule.widths,
        });
        const entry = isBuild
          ? createBuildImageEntry({
              emitFile: this.emitFile.bind(this),
              image,
            })
          : createDevelopmentImageEntry({
              developmentAssets,
              image,
              viteBase,
            });
        if (!enabled) {
          return createUnoptimizedReactImageVirtualModule({
            image: entry,
          });
        }
        return createReactImageVirtualModule({
          image: entry,
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
          this.addWatchFile(buildWatchMarkerPath);
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

        let entries: ImageVariantManifest;
        try {
          const manifest = await getManifest(imageVariantsModule);
          entries = await createCollectionImageEntries({
            cacheDirectory: transformedImageCacheDirectory,
            enabled,
            emitFile: isBuild ? this.emitFile.bind(this) : undefined,
            formatSettings,
            lossless,
            manifest,
            base: imageVariantsModule.base,
            sourceDirectory: imageVariantsModule.sourceDirectory,
            viteBase,
            widths: imageVariantsModule.widths,
            watchDirectory: imageVariantsModule.watchDirectory,
            addWatchFile: this.addWatchFile.bind(this),
            developmentAssets,
          });
        } catch (error) {
          if (!buildWatchMarkerPath) {
            throw error;
          }
          const manifestError =
            error instanceof Error
              ? error
              : new Error('Unable to scan the image collection', {
                  cause: error,
                });
          failedBuildWatchManifestCacheKeys.add(
            createManifestCacheKey(imageVariantsModule),
          );
          this.warn(
            `${manifestError.message}. The watch build will use unoptimized image fallbacks until the source changes.`,
          );
          return `import ${JSON.stringify(`${buildWatchMarkerPath}?raw`)};\n${createEmptyReactImageCollectionVirtualModule()}`;
        }
        failedBuildWatchManifestCacheKeys.delete(
          createManifestCacheKey(imageVariantsModule),
        );
        const moduleCode = createReactImageCollectionVirtualModule({
          manifest: entries,
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
      failedBuildWatchManifestCacheKeys.clear();
      if (buildWatchMarker) {
        rmSync(buildWatchMarker.directory, { force: true, recursive: true });
        buildWatchMarker = undefined;
      }
    },
    configureServer(server) {
      devServer = server;
      if (enabled) {
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
      }
      server.middlewares?.use((request, response, next) => {
        if (!request.url) {
          return next();
        }
        const pathname = new URL(request.url, 'http://vite.local').pathname;
        const key = parseDevelopmentAssetKey(pathname, viteBase);
        if (!key) {
          return next();
        }
        const asset = developmentAssets.get(key);
        if (!asset) {
          response.statusCode = 404;
          response.end();
          return;
        }
        response.statusCode = 200;
        response.setHeader('Cache-Control', 'no-cache');
        response.setHeader('Content-Type', asset.contentType);
        response.end(asset.buffer);
      });

      const cleanup = () => {
        clearTimeout(invalidationTimer);
        if (enabled) {
          server.watcher.off('add', handleSourceChange);
          server.watcher.off('change', handleSourceChange);
          server.watcher.off('unlink', handleSourceChange);
        }
      };
      server.httpServer?.once('close', cleanup);
    },
  };

  return [plugin];
}

async function prepareResponsiveImage({
  cacheDirectory,
  enabled,
  formatSettings,
  lossless,
  sourcePath,
  widths,
}: Readonly<{
  cacheDirectory: string;
  enabled: boolean;
  formatSettings: ReturnType<typeof resolveImageVariantFormatSettings>;
  lossless: boolean;
  sourcePath: string;
  widths: readonly (number | 'original')[];
}>): Promise<PreparedResponsiveImage> {
  const source = await readFile(sourcePath);
  const metadata = await sharp(source).metadata();
  const { height: sourceHeight, width: sourceWidth } =
    getImageDisplayDimensions(metadata);
  if (!sourceWidth || !sourceHeight) {
    throw new Error(`Image dimensions are unavailable: ${sourcePath}`);
  }
  const sourceExtension = path.extname(sourcePath).toLowerCase();
  if (!sourceExtension) {
    throw new Error(`Image source extension is unavailable: ${sourcePath}`);
  }
  return {
    source,
    sourceExtension,
    sourceHash: createHash('sha256').update(source).digest('hex'),
    sourceHeight,
    sourcePath,
    sourceWidth,
    variants: enabled
      ? await generateImageVariants({
          cacheDirectory,
          formatSettings,
          lossless,
          sourcePath,
          widths,
        })
      : { avif: [], webp: [] },
  };
}

async function createCollectionImageEntries({
  addWatchFile,
  base,
  cacheDirectory,
  developmentAssets,
  enabled,
  emitFile,
  formatSettings,
  lossless,
  manifest,
  sourceDirectory,
  viteBase,
  watchDirectory,
  widths,
}: Readonly<{
  addWatchFile: (file: string) => void;
  base: string;
  cacheDirectory: string;
  developmentAssets: Map<string, DevelopmentAsset>;
  enabled: boolean;
  emitFile:
    | ((asset: { fileName: string; source: Buffer; type: 'asset' }) => string)
    | undefined;
  formatSettings: ReturnType<typeof resolveImageVariantFormatSettings>;
  lossless: boolean;
  manifest: ImageVariantManifest;
  sourceDirectory: string;
  viteBase: string;
  watchDirectory: string;
  widths: readonly (number | 'original')[];
}>): Promise<ImageVariantManifest> {
  const publicPathPrefix = `${base}/`;
  const publicUrls = Object.keys(manifest).filter(
    (publicUrl) => manifest[publicUrl] !== undefined,
  );
  const entries: [string, ImageVariantEntry][] = [];
  const concurrency = 4;

  for (let index = 0; index < publicUrls.length; index += concurrency) {
    const batch = publicUrls.slice(index, index + concurrency);
    entries.push(
      ...(await Promise.all(
        batch.map(async (publicUrl) => {
          const sourcePath = resolveManifestSourcePath({
            publicPathPrefix,
            publicUrl,
            sourceDirectory,
          });
          addWatchFile(sourcePath);
          addWatchFile(
            path.join(
              watchDirectory,
              path.relative(sourceDirectory, sourcePath),
            ),
          );
          const image = await prepareResponsiveImage({
            cacheDirectory,
            enabled,
            formatSettings,
            lossless,
            sourcePath,
            widths,
          });
          const entry = emitFile
            ? createBuildImageEntry({ emitFile, image })
            : createDevelopmentImageEntry({
                developmentAssets,
                image,
                viteBase,
              });
          return [publicUrl, entry] satisfies [string, ImageVariantEntry];
        }),
      )),
    );
  }

  return Object.fromEntries(entries) as ImageVariantManifest;
}

function createBuildImageEntry({
  emitFile,
  image,
}: Readonly<{
  emitFile: (asset: {
    fileName: string;
    source: Buffer;
    type: 'asset';
  }) => string;
  image: PreparedResponsiveImage;
}>): ImageVariantEntry {
  const sourceFileName = createOriginalAssetFileName(image);
  const sourceReferenceId = emitFile({
    fileName: sourceFileName,
    source: image.source,
    type: 'asset',
  });
  return {
    avif: image.variants.avif.map((variant) =>
      emitImageVariant({ emitFile, image, variant }),
    ),
    height: image.sourceHeight,
    src: createViteAssetUrl(sourceReferenceId),
    webp: image.variants.webp.map((variant) =>
      emitImageVariant({ emitFile, image, variant }),
    ),
    width: image.sourceWidth,
  };
}

function emitImageVariant({
  emitFile,
  image,
  variant,
}: Readonly<{
  emitFile: (asset: {
    fileName: string;
    source: Buffer;
    type: 'asset';
  }) => string;
  image: PreparedResponsiveImage;
  variant: GeneratedImageVariants['avif'][number];
}>) {
  const fileName = createVariantAssetFileName(image, variant);
  const referenceId = emitFile({
    fileName,
    source: variant.buffer,
    type: 'asset',
  });
  return { src: createViteAssetUrl(referenceId), width: variant.width };
}

function createDevelopmentImageEntry({
  developmentAssets,
  image,
  viteBase,
}: Readonly<{
  developmentAssets: Map<string, DevelopmentAsset>;
  image: PreparedResponsiveImage;
  viteBase: string;
}>): ImageVariantEntry {
  const sourceKey = `${image.sourceHash}${image.sourceExtension}`;
  developmentAssets.set(sourceKey, {
    buffer: image.source,
    contentType: getImageContentType(image.sourceExtension),
  });
  return {
    avif: image.variants.avif.map((variant) =>
      createDevelopmentVariant({ developmentAssets, variant, viteBase }),
    ),
    height: image.sourceHeight,
    src: createDevelopmentAssetUrl(sourceKey, viteBase),
    webp: image.variants.webp.map((variant) =>
      createDevelopmentVariant({ developmentAssets, variant, viteBase }),
    ),
    width: image.sourceWidth,
  };
}

function createDevelopmentVariant({
  developmentAssets,
  variant,
  viteBase,
}: Readonly<{
  developmentAssets: Map<string, DevelopmentAsset>;
  variant: GeneratedImageVariants['avif'][number];
  viteBase: string;
}>) {
  const key = `${variant.cacheKey}.${variant.format}`;
  developmentAssets.set(key, {
    buffer: variant.buffer,
    contentType: getImageContentType(`.${variant.format}`),
  });
  return {
    src: createDevelopmentAssetUrl(key, viteBase),
    width: variant.width,
  };
}

function createOriginalAssetFileName(image: PreparedResponsiveImage) {
  const sourceName = path.basename(
    image.sourcePath,
    path.extname(image.sourcePath),
  );
  return `assets/${sourceName}.${createAssetHash(image.source)}${image.sourceExtension}`;
}

function createVariantAssetFileName(
  image: PreparedResponsiveImage,
  variant: GeneratedImageVariants['avif'][number],
) {
  const sourceName = path.basename(
    image.sourcePath,
    path.extname(image.sourcePath),
  );
  return `assets/${sourceName}.${variant.width}x${variant.height}.${createAssetHash(variant.buffer)}.${variant.format}`;
}

function createAssetHash(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 8);
}

function createDevelopmentAssetUrl(key: string, viteBase: string) {
  return `${viteBase}${developmentAssetPath.slice(1)}${key}`;
}

function parseDevelopmentAssetKey(pathname: string, viteBase: string) {
  const prefix = `${viteBase}${developmentAssetPath.slice(1)}`;
  if (!pathname.startsWith(prefix)) {
    return undefined;
  }
  const value = pathname.slice(prefix.length);
  return /^[a-f0-9]{64}\.(?:avif|gif|heif|jpeg|jpg|png|tiff|webp)$/.test(value)
    ? value
    : undefined;
}

function getImageContentType(extension: string) {
  switch (extension.toLowerCase()) {
    case '.avif':
      return 'image/avif';
    case '.gif':
      return 'image/gif';
    case '.heif':
      return 'image/heif';
    case '.jpeg':
    case '.jpg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.tiff':
      return 'image/tiff';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
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
