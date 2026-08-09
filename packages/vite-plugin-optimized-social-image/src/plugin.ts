import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import sharp, { type Metadata } from 'sharp';
import { normalizePath, type Plugin, type ViteDevServer } from 'vite';
import type { SocialImageFormat } from './types.ts';
import {
  isPathInside,
  parseSocialImageCollectionVirtualModuleRequest,
  type ResolvedSocialImageCollectionVirtualModule,
  resolveSocialImageCollectionSourceDirectory,
  resolveSocialImageCollectionVirtualModule,
} from './virtual.ts';

export type OptimizedSocialImagePluginOptions = Readonly<{
  /** Parent directory for persistent transformed social-image assets. */
  cacheDirectory?: string;
}>;

const imageSourceExtensions = new Set([
  '.avif',
  '.gif',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tiff',
  '.webp',
]);
const cacheSchemaVersion = 1;
const cacheEncoderVersion = Object.entries(sharp.versions)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, version]) => `${name}:${version}`)
  .join('\0');
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
}: OptimizedSocialImagePluginOptions = {}): Plugin {
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
      getDisplayDimensions(sourceMetadata);
    if (!sourceWidth || !sourceHeight) {
      throw new Error(`Image dimensions are unavailable: ${sourcePath}`);
    }

    const format = selectSocialImageFormat(sourceMetadata);
    const animated = format === 'gif';
    const sourceHash = createHash('sha256').update(source).digest('hex');
    const cacheKey = createCacheKey({
      animated,
      format,
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
    source,
    sourceHeight,
    sourceWidth,
    targetWidth,
  }: Readonly<{
    animated: boolean;
    cacheKey: string;
    format: SocialImageFormat;
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

    const buffer = await sharp(source, animated ? { animated: true } : {})
      .autoOrient()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .toFormat(format)
      .toBuffer();
    const metadata = await sharp(buffer, animated ? { animated: true } : {})
      .metadata()
      .catch((error: unknown) => {
        throw new Error('Unable to read generated social image metadata', {
          cause: error,
        });
      });
    const dimensions = getDisplayDimensions(metadata);
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
      viteBase = normalizeBasePath(config.base);
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
      devServer?.watcher.add([
        collection.sourceDirectory,
        collection.watchDirectory,
      ]);
      return collection.id;
    },
    async load(id) {
      const collection = resolvedModules.get(id);
      if (!collection) {
        return;
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
          viteBase,
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
      invalidateAffectedCollections(normalizeSourcePath(id));
    },
    configureServer(server) {
      devServer = server;
      server.watcher.add(
        [...resolvedModules.values()].flatMap((collection) => [
          collection.sourceDirectory,
          collection.watchDirectory,
        ]),
      );

      const handleSourceChange = (filePath: string) => {
        invalidateAffectedCollections(normalizeSourcePath(filePath));
      };
      server.watcher.on('add', handleSourceChange);
      server.watcher.on('change', handleSourceChange);
      server.watcher.on('unlink', handleSourceChange);
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
        server.watcher.off('add', handleSourceChange);
        server.watcher.off('change', handleSourceChange);
        server.watcher.off('unlink', handleSourceChange);
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

function getDisplayDimensions(metadata: Metadata) {
  const width = metadata.autoOrient.width ?? metadata.width;
  const orientedHeight = metadata.autoOrient.height ?? metadata.height;
  return {
    height:
      (metadata.pages ?? 1) > 1
        ? (metadata.pageHeight ?? orientedHeight)
        : orientedHeight,
    width,
  };
}

function createCacheKey({
  animated,
  format,
  sourceHash,
  targetWidth,
}: Readonly<{
  animated: boolean;
  format: SocialImageFormat;
  sourceHash: string;
  targetWidth: number;
}>) {
  return createHash('sha256')
    .update(
      `${cacheSchemaVersion}\0${cacheEncoderVersion}\0${sourceHash}\0${format}\0${targetWidth}\0${String(animated)}`,
    )
    .digest('hex');
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
  try {
    const [buffer, serializedMetadata] = await Promise.all([
      readFile(path.join(cacheDirectory, 'assets', `${cacheKey}.${format}`)),
      readFile(
        path.join(cacheDirectory, 'metadata', `${cacheKey}.json`),
        'utf8',
      ),
    ]);
    const metadata = JSON.parse(serializedMetadata) as CachedSocialImage;
    if (
      metadata.format !== format ||
      !Number.isSafeInteger(metadata.width) ||
      metadata.width <= 0 ||
      !Number.isSafeInteger(metadata.height) ||
      metadata.height <= 0
    ) {
      return undefined;
    }
    return { buffer, metadata };
  } catch {
    return undefined;
  }
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
  const assetDirectory = path.join(cacheDirectory, 'assets');
  const metadataDirectory = path.join(cacheDirectory, 'metadata');
  await Promise.all([
    mkdir(assetDirectory, { recursive: true }),
    mkdir(metadataDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeAtomically({
      data: buffer,
      filePath: path.join(assetDirectory, `${cacheKey}.${metadata.format}`),
    }),
    writeAtomically({
      data: JSON.stringify(metadata),
      filePath: path.join(metadataDirectory, `${cacheKey}.json`),
    }),
  ]);
}

async function writeAtomically({
  data,
  filePath,
}: Readonly<{
  data: string | Uint8Array;
  filePath: string;
}>) {
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, data);
  await rename(temporaryPath, filePath);
}

async function listSupportedImageFiles(
  directory: string,
  relativeDirectory = '',
): Promise<string[]> {
  const currentDirectory = path.join(directory, relativeDirectory);
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of [...entries].sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSupportedImageFiles(directory, relativePath)));
      continue;
    }
    if (
      entry.isFile() &&
      imageSourceExtensions.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

function createBuildCollectionModule({
  emitFile,
  entries,
  viteBase,
}: Readonly<{
  emitFile: (asset: {
    fileName: string;
    source: Buffer;
    type: 'asset';
  }) => string;
  entries: readonly SocialImageCollectionEntry[];
  viteBase: string;
}>) {
  const manifestEntries = entries.map((entry) => {
    const fileName = createAssetFileName(entry);
    emitFile({
      fileName,
      source: entry.buffer,
      type: 'asset',
    });
    return `${JSON.stringify(entry.publicUrl)}:{format:${JSON.stringify(entry.format)},height:${entry.height},src:${JSON.stringify(`${viteBase}${fileName}`)},width:${entry.width}}`;
  });
  return `const manifest={${manifestEntries.join(',')}};export { manifest };`;
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

function normalizeBasePath(base: string) {
  if (base === '' || base === './') {
    return './';
  }
  if (isAbsoluteUrl(base)) {
    return `${base.replace(/\/+$/, '')}/`;
  }
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  return normalizedBase === '/' ? '/' : `${normalizedBase}/`;
}

function isAbsoluteUrl(value: string) {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}

function normalizeSourcePath(sourcePath: string) {
  return normalizePath(sourcePath);
}

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join('/');
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
