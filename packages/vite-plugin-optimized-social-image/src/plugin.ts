import { createHash } from 'node:crypto';
import { readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import {
  createViteAssetUrl,
  getImageDisplayDimensions,
  getSharpEncoderVersion,
  isPathInside,
  listSupportedImageFiles,
  normalizeSourcePath,
  normalizeViteBasePath,
  readCachedAsset,
  toPosixPath,
  writeCachedAsset,
} from '@kamatte-syndrome/image-optimization-core';
import sharp, { type Metadata } from 'sharp';
import type { Plugin, ViteDevServer } from 'vite';
import {
  type GifSocialImageFormatOptions,
  type JpegSocialImageFormatOptions,
  type PngSocialImageFormatOptions,
  resolveSocialImageFormatSettings,
  type SocialImageFormatSettings,
} from './format.ts';
import type { SocialImageFormat } from './types.ts';
import {
  parseSocialImageCollectionVirtualModuleRequest,
  type ResolvedSocialImageCollectionVirtualModule,
  resolveSocialImageCollectionSourceDirectory,
  resolveSocialImageCollectionVirtualModule,
} from './virtual.ts';

export type OptimizedSocialImagePluginOptions = Readonly<{
  /** Parent directory for persistent transformed social-image assets. */
  cacheDirectory?: string;
  /** Disable transformations and expose an empty manifest. */
  enabled?: boolean;
  /** GIF encoding settings. */
  gif?: GifSocialImageFormatOptions;
  /** JPEG encoding settings. */
  jpeg?: JpegSocialImageFormatOptions;
  /** PNG encoding settings. */
  png?: PngSocialImageFormatOptions;
}>;

const cacheSchemaVersion = 1;
const cacheEncoderVersion = getSharpEncoderVersion();
const devAssetPath = '/@optimized-social-image/';
const transformationConcurrency = 4;

type CachedSocialImage = Readonly<{
  format: SocialImageFormat;
  height: number;
  width: number;
}>;

type GeneratedSocialImage = CachedSocialImage &
  Readonly<{
    buffer: Buffer;
    cacheKey: string;
    sourceHeight: number;
    sourcePath: string;
    sourceWidth: number;
  }>;

type SocialImageCollectionEntry = GeneratedSocialImage &
  Readonly<{
    publicUrl: string;
  }>;

type DevelopmentAsset = Readonly<{
  buffer: Buffer;
  format: SocialImageFormat;
}>;

export function optimizedSocialImage({
  cacheDirectory,
  enabled = true,
  gif,
  jpeg,
  png,
}: OptimizedSocialImagePluginOptions = {}): Plugin {
  const formatSettings = resolveSocialImageFormatSettings({ gif, jpeg, png });
  let devServer: ViteDevServer | undefined;
  let isBuild = false;
  let rootDirectory = process.cwd();
  let viteBase = '/';
  let resolvedCacheDirectory = '';
  let invalidationTimer: ReturnType<typeof setTimeout> | undefined;
  const resolvedModules = new Map<
    string,
    ResolvedSocialImageCollectionVirtualModule
  >();
  const collectionPromises = new Map<
    string,
    Promise<readonly SocialImageCollectionEntry[]>
  >();
  const transformationPromises = new Map<
    string,
    Promise<Omit<GeneratedSocialImage, 'sourcePath'>>
  >();
  const developmentAssets = new Map<string, DevelopmentAsset>();
  const pendingInvalidationIds = new Set<string>();

  const getCollection = (
    collection: ResolvedSocialImageCollectionVirtualModule,
  ) => {
    const cachedCollection = collectionPromises.get(collection.id);
    if (cachedCollection) {
      return cachedCollection;
    }

    const result = createSocialImageCollection(collection).catch(
      (error: unknown) => {
        collectionPromises.delete(collection.id);
        throw error;
      },
    );
    collectionPromises.set(collection.id, result);
    return result;
  };

  const createSocialImageCollection = async (
    collection: ResolvedSocialImageCollectionVirtualModule,
  ) => {
    const relativePaths = await listSupportedImageFiles(
      collection.sourceDirectory,
    );
    const publicPathPrefix = `${collection.base}/`;
    const entries: SocialImageCollectionEntry[] = [];

    for (
      let index = 0;
      index < relativePaths.length;
      index += transformationConcurrency
    ) {
      const batch = relativePaths.slice(
        index,
        index + transformationConcurrency,
      );
      entries.push(
        ...(await Promise.all(
          batch.map(async (relativePath) => {
            if (/[?#]/.test(relativePath)) {
              throw new Error(
                `Image source path must not contain ? or #: ${toPosixPath(relativePath)}`,
              );
            }
            const sourcePath = path.join(
              collection.sourceDirectory,
              relativePath,
            );
            const image = await getGeneratedSocialImage({
              sourcePath,
              targetWidth: collection.width,
            });
            return {
              ...image,
              publicUrl: `${publicPathPrefix}${toPosixPath(relativePath)}`,
            };
          }),
        )),
      );
    }

    return entries;
  };

  const getGeneratedSocialImage = async ({
    sourcePath,
    targetWidth,
  }: Readonly<{
    sourcePath: string;
    targetWidth: number;
  }>): Promise<GeneratedSocialImage> => {
    const source = await readFile(sourcePath);
    const sourceMetadata = await readSourceMetadata(source);
    const { height: sourceHeight, width: sourceWidth } =
      getImageDisplayDimensions(sourceMetadata);
    if (!sourceWidth || !sourceHeight) {
      throw new Error(`Image dimensions are unavailable: ${sourcePath}`);
    }

    const format = selectSocialImageFormat(sourceMetadata);
    const animated = format === 'gif';
    const sourceHash = createHash('sha256').update(source).digest('hex');
    const cacheKey = createCacheKey({
      animated,
      format,
      formatSettings,
      sourceHash,
      targetWidth,
    });
    const cachedTransformation = transformationPromises.get(cacheKey);
    const transformation =
      cachedTransformation ??
      createTransformedSocialImage({
        animated,
        cacheKey,
        format,
        formatSettings,
        source,
        sourceHeight,
        sourceWidth,
        targetWidth,
      }).catch((error: unknown) => {
        transformationPromises.delete(cacheKey);
        throw error;
      });
    transformationPromises.set(cacheKey, transformation);

    return { ...(await transformation), sourcePath };
  };

  const createTransformedSocialImage = async ({
    animated,
    cacheKey,
    format,
    formatSettings,
    source,
    sourceHeight,
    sourceWidth,
    targetWidth,
  }: Readonly<{
    animated: boolean;
    cacheKey: string;
    format: SocialImageFormat;
    formatSettings: SocialImageFormatSettings;
    source: Buffer;
    sourceHeight: number;
    sourceWidth: number;
    targetWidth: number;
  }>): Promise<Omit<GeneratedSocialImage, 'sourcePath'>> => {
    const cached = await readSocialImageCache({
      cacheDirectory: resolvedCacheDirectory,
      cacheKey,
      format,
    });
    if (cached) {
      return {
        ...cached.metadata,
        buffer: cached.buffer,
        cacheKey,
        sourceHeight,
        sourceWidth,
      };
    }

    const buffer = await createSocialImageBuffer({
      animated,
      format,
      formatSettings,
      source,
      targetWidth,
    });
    const metadata = await sharp(buffer, animated ? { animated: true } : {})
      .metadata()
      .catch((error: unknown) => {
        throw new Error('Unable to read generated social image metadata', {
          cause: error,
        });
      });
    const dimensions = getImageDisplayDimensions(metadata);
    if (!dimensions.width || !dimensions.height) {
      throw new Error('Generated social image dimensions are unavailable');
    }
    const cachedMetadata = {
      format,
      height: dimensions.height,
      width: dimensions.width,
    } satisfies CachedSocialImage;
    await writeSocialImageCache({
      buffer,
      cacheDirectory: resolvedCacheDirectory,
      cacheKey,
      metadata: cachedMetadata,
    });

    return {
      ...cachedMetadata,
      buffer,
      cacheKey,
      sourceHeight,
      sourceWidth,
    };
  };

  const invalidateAffectedCollections = (filePath: string) => {
    const affectedCollections = [...resolvedModules.values()].filter(
      (collection) =>
        isPathInside(collection.sourceDirectory, filePath) ||
        isPathInside(collection.watchDirectory, filePath),
    );
    if (affectedCollections.length === 0) {
      return;
    }

    for (const collection of affectedCollections) {
      collectionPromises.delete(collection.id);
      pendingInvalidationIds.add(collection.id);
    }
    developmentAssets.clear();
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

  return {
    name: 'optimized-social-image',
    enforce: 'pre',
    sharedDuringBuild: true,
    configResolved(config) {
      isBuild = config.command === 'build';
      rootDirectory = config.root;
      viteBase = normalizeViteBasePath(config.base);
      resolvedCacheDirectory = path.resolve(
        rootDirectory,
        cacheDirectory ??
          'node_modules/.cache/vite-plugin-optimized-social-image',
      );
    },
    async resolveId(id, importer) {
      const request = parseSocialImageCollectionVirtualModuleRequest(id);
      if (!request) {
        return;
      }

      const sourceDirectory =
        request.src.startsWith('/') || request.src.startsWith('.')
          ? resolveSocialImageCollectionSourceDirectory({
              importer,
              rootDirectory,
              src: request.src,
            })
          : await resolveAliasedSourceDirectory({
              importer,
              resolve: (source, sourceImporter) =>
                this.resolve(source, sourceImporter, { skipSelf: true }),
              src: request.src,
            });
      await assertSourceDirectory(sourceDirectory, request.src);
      const watchDirectory = normalizeSourcePath(
        await realpath(sourceDirectory),
      );
      const collection = resolveSocialImageCollectionVirtualModule({
        ...request,
        sourceDirectory,
        watchDirectory,
      });
      resolvedModules.set(collection.id, collection);
      if (enabled) {
        devServer?.watcher.add([
          collection.sourceDirectory,
          collection.watchDirectory,
        ]);
      }
      return collection.id;
    },
    async load(id) {
      const collection = resolvedModules.get(id);
      if (!collection) {
        return;
      }

      if (!enabled) {
        return createEmptyCollectionModule();
      }

      const entries = await getCollection(collection);
      for (const entry of entries) {
        this.addWatchFile(entry.sourcePath);
        this.addWatchFile(
          path.join(
            collection.watchDirectory,
            path.relative(collection.sourceDirectory, entry.sourcePath),
          ),
        );
      }

      if (isBuild) {
        return createBuildCollectionModule({
          emitFile: this.emitFile.bind(this),
          entries,
        });
      }

      for (const entry of entries) {
        developmentAssets.set(entry.cacheKey, {
          buffer: entry.buffer,
          format: entry.format,
        });
      }
      return createDevelopmentCollectionModule({
        entries,
        viteBase,
      });
    },
    watchChange(id) {
      if (enabled) {
        invalidateAffectedCollections(normalizeSourcePath(id));
      }
    },
    configureServer(server) {
      devServer = server;
      if (enabled) {
        server.watcher.add(
          [...resolvedModules.values()].flatMap((collection) => [
            collection.sourceDirectory,
            collection.watchDirectory,
          ]),
        );
      }

      const handleSourceChange = (filePath: string) => {
        invalidateAffectedCollections(normalizeSourcePath(filePath));
      };
      if (enabled) {
        server.watcher.on('add', handleSourceChange);
        server.watcher.on('change', handleSourceChange);
        server.watcher.on('unlink', handleSourceChange);
      }
      server.middlewares.use((request, response, next) => {
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
        response.setHeader('Content-Type', getContentType(asset.format));
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
  } satisfies Plugin;
}

async function readSourceMetadata(source: Buffer) {
  try {
    return await sharp(source).metadata();
  } catch (error) {
    throw new Error('Unable to read source image metadata', { cause: error });
  }
}

function selectSocialImageFormat(metadata: Metadata): SocialImageFormat {
  if (metadata.format === 'gif') {
    return 'gif';
  }
  return metadata.hasAlpha ? 'png' : 'jpeg';
}

function createCacheKey({
  animated,
  format,
  formatSettings,
  sourceHash,
  targetWidth,
}: Readonly<{
  animated: boolean;
  format: SocialImageFormat;
  formatSettings: SocialImageFormatSettings;
  sourceHash: string;
  targetWidth: number;
}>) {
  return createHash('sha256')
    .update(
      `${cacheSchemaVersion}\0${cacheEncoderVersion}\0${sourceHash}\0${format}\0${JSON.stringify(formatSettings[format])}\0${targetWidth}\0${String(animated)}`,
    )
    .digest('hex');
}

async function createSocialImageBuffer({
  animated,
  format,
  formatSettings,
  source,
  targetWidth,
}: Readonly<{
  animated: boolean;
  format: SocialImageFormat;
  formatSettings: SocialImageFormatSettings;
  source: Buffer;
  targetWidth: number;
}>) {
  const image = sharp(source, animated ? { animated: true } : {})
    .autoOrient()
    .resize({ width: targetWidth, withoutEnlargement: true });

  switch (format) {
    case 'gif':
      return image.gif(formatSettings.gif).toBuffer();
    case 'jpeg':
      return image.jpeg(formatSettings.jpeg).toBuffer();
    case 'png':
      return image.png(formatSettings.png).toBuffer();
  }
}

async function readSocialImageCache({
  cacheDirectory,
  cacheKey,
  format,
}: Readonly<{
  cacheDirectory: string;
  cacheKey: string;
  format: SocialImageFormat;
}>) {
  return readCachedAsset({
    cacheDirectory,
    cacheKey,
    fileExtension: format,
    parseMetadata(metadata) {
      return isCachedSocialImageMetadata(metadata, format)
        ? metadata
        : undefined;
    },
  });
}

async function writeSocialImageCache({
  buffer,
  cacheDirectory,
  cacheKey,
  metadata,
}: Readonly<{
  buffer: Buffer;
  cacheDirectory: string;
  cacheKey: string;
  metadata: CachedSocialImage;
}>) {
  await writeCachedAsset({
    buffer,
    cacheDirectory,
    cacheKey,
    fileExtension: metadata.format,
    metadata,
  });
}

function isCachedSocialImageMetadata(
  metadata: unknown,
  format: SocialImageFormat,
): metadata is CachedSocialImage {
  if (!isRecord(metadata) || metadata.format !== format) {
    return false;
  }
  const { height, width } = metadata;
  return (
    typeof width === 'number' &&
    Number.isSafeInteger(width) &&
    width > 0 &&
    typeof height === 'number' &&
    Number.isSafeInteger(height) &&
    height > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createBuildCollectionModule({
  emitFile,
  entries,
}: Readonly<{
  emitFile: (asset: {
    fileName: string;
    source: Buffer;
    type: 'asset';
  }) => string;
  entries: readonly SocialImageCollectionEntry[];
}>) {
  const manifestEntries = entries.map((entry) => {
    const fileName = createAssetFileName(entry);
    const referenceId = emitFile({
      fileName,
      source: entry.buffer,
      type: 'asset',
    });
    return `${JSON.stringify(entry.publicUrl)}:{format:${JSON.stringify(entry.format)},height:${entry.height},src:${JSON.stringify(createViteAssetUrl(referenceId))},width:${entry.width}}`;
  });
  return `const manifest={${manifestEntries.join(',')}};export { manifest };`;
}

function createEmptyCollectionModule() {
  return 'const manifest={};export { manifest };';
}

function createDevelopmentCollectionModule({
  entries,
  viteBase,
}: Readonly<{
  entries: readonly SocialImageCollectionEntry[];
  viteBase: string;
}>) {
  const manifestEntries = entries.map(
    (entry) =>
      `${JSON.stringify(entry.publicUrl)}:{format:${JSON.stringify(entry.format)},height:${entry.height},src:${JSON.stringify(`${viteBase}${devAssetPath.slice(1)}${entry.cacheKey}.${entry.format}`)},width:${entry.width}}`,
  );
  return `const manifest={${manifestEntries.join(',')}};export { manifest };`;
}

function createAssetFileName(entry: SocialImageCollectionEntry) {
  const sourceName = path.basename(
    entry.sourcePath,
    path.extname(entry.sourcePath),
  );
  const dimensionsChanged =
    entry.sourceWidth !== entry.width || entry.sourceHeight !== entry.height;
  const hash = createHash('sha256')
    .update(entry.buffer)
    .digest('hex')
    .slice(0, 8);
  return `assets/${sourceName}${dimensionsChanged ? `.${entry.width}x${entry.height}` : ''}.${hash}.${entry.format}`;
}

function parseDevelopmentAssetKey(pathname: string, viteBase: string) {
  const prefix = `${viteBase}${devAssetPath.slice(1)}`;
  if (!pathname.startsWith(prefix)) {
    return undefined;
  }
  const value = pathname.slice(prefix.length);
  const match = /^([a-f0-9]{64})\.(?:gif|jpeg|png)$/.exec(value);
  return match?.[1];
}

function getContentType(format: SocialImageFormat) {
  return format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
}

async function assertSourceDirectory(sourceDirectory: string, src: string) {
  try {
    const entries = await readdir(sourceDirectory);
    if (entries) {
      return;
    }
  } catch (error) {
    throw new Error(`Unable to read image source directory: ${src}`, {
      cause: error,
    });
  }
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
