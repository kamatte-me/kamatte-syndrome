import { createHash } from 'node:crypto';
import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { ContentImageEntry, ContentImageManifest } from './types.ts';

const cacheVersion = 1;
const staticImageExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

type CacheRecord = {
  contentHash: string;
  entry: ContentImageEntry | null;
  files: string[];
};

type CacheFile = {
  configHash: string;
  records: Record<string, CacheRecord>;
  version: number;
};

export type GenerateContentImagesOptions = {
  cacheDirectory: string;
  outputDirectory: string;
  publicPath: string;
  sourceDirectory: string;
};

export async function generateContentImages({
  cacheDirectory,
  outputDirectory,
  publicPath,
  sourceDirectory,
}: GenerateContentImagesOptions): Promise<ContentImageManifest> {
  const normalizedPublicPath = `/${publicPath.replace(/^\/+|\/+$/g, '')}`;
  const configHash = createHash('sha256')
    .update(
      JSON.stringify({
        fallbackAvifQuality: 80,
        fallbackJpegQuality: 95,
        fallbackPngCompressionLevel: 9,
        fallbackWebpQuality: 95,
        publicPath: normalizedPublicPath,
      }),
    )
    .digest('hex');
  const cacheFilePath = path.join(cacheDirectory, 'cache.json');
  const previousCache = await readCache(cacheFilePath, configHash);
  const resolvedOutputDirectory = path.resolve(outputDirectory);
  const temporaryDirectory = path.join(
    path.dirname(resolvedOutputDirectory),
    `${path.basename(resolvedOutputDirectory)}.tmp-${process.pid}`,
  );
  const records: Record<string, CacheRecord> = {};
  const manifest: Record<string, ContentImageEntry> = {};

  await rm(temporaryDirectory, { force: true, recursive: true });
  await mkdir(temporaryDirectory, { recursive: true });

  try {
    const sourceFiles = await listFiles(sourceDirectory);

    for (const relativePath of sourceFiles) {
      const sourcePath = path.join(sourceDirectory, relativePath);
      const source = await readFile(sourcePath);
      const contentHash = createHash('sha256').update(source).digest('hex');
      const previousRecord = previousCache.records[relativePath];

      if (
        previousRecord?.contentHash === contentHash &&
        (await recordFilesExist(resolvedOutputDirectory, previousRecord.files))
      ) {
        await copyRecordFiles(
          resolvedOutputDirectory,
          temporaryDirectory,
          previousRecord.files,
        );
        records[relativePath] = previousRecord;
        if (previousRecord.entry) {
          manifest[previousRecord.entry.src] = previousRecord.entry;
        }
        continue;
      }

      const record = await processImage({
        contentHash,
        outputDirectory: temporaryDirectory,
        publicPath: normalizedPublicPath,
        relativePath,
        source,
      });
      records[relativePath] = record;
      if (record.entry) {
        manifest[record.entry.src] = record.entry;
      }
    }

    await rm(resolvedOutputDirectory, { force: true, recursive: true });
    await mkdir(path.dirname(resolvedOutputDirectory), { recursive: true });
    await rename(temporaryDirectory, resolvedOutputDirectory);
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(
      cacheFilePath,
      `${JSON.stringify({ configHash, records, version: cacheVersion })}\n`,
    );
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  return manifest;
}

type ProcessImageOptions = {
  contentHash: string;
  outputDirectory: string;
  publicPath: string;
  relativePath: string;
  source: Buffer;
};

async function processImage({
  contentHash,
  outputDirectory,
  publicPath,
  relativePath,
  source,
}: ProcessImageOptions): Promise<CacheRecord> {
  const extension = path.extname(relativePath).toLowerCase();
  const outputPath = path.join(outputDirectory, relativePath);
  const publicUrl = `${publicPath}/${toPosixPath(relativePath)}`;

  await mkdir(path.dirname(outputPath), { recursive: true });

  if (staticImageExtensions.has(extension)) {
    try {
      return await processStaticImage({
        contentHash,
        outputPath,
        publicUrl,
        relativePath,
        source,
      });
    } catch (error) {
      throw new Error(`Failed to process content image: ${relativePath}`, {
        cause: error,
      });
    }
  }

  if (extension === '.gif') {
    try {
      await sharp(source, { animated: true })
        .gif({ effort: 7 })
        .toFile(outputPath);
    } catch (error) {
      throw new Error(`Failed to process content image: ${relativePath}`, {
        cause: error,
      });
    }
  } else {
    await writeFile(outputPath, source);
  }

  return {
    contentHash,
    entry: null,
    files: [relativePath],
  };
}

type ProcessStaticImageOptions = {
  contentHash: string;
  outputPath: string;
  publicUrl: string;
  relativePath: string;
  source: Buffer;
};

async function processStaticImage({
  contentHash,
  outputPath,
  publicUrl,
  relativePath,
  source,
}: ProcessStaticImageOptions): Promise<CacheRecord> {
  const fallback = createFallbackPipeline(source, path.extname(relativePath));
  const fallbackInfo = await fallback.toFile(outputPath);
  const width = fallbackInfo.width;
  const height = fallbackInfo.height;

  if (!width || !height) {
    throw new Error('Image dimensions are unavailable');
  }

  return {
    contentHash,
    entry: { avif: [], height, src: publicUrl, webp: [], width },
    files: [relativePath],
  };
}

function createFallbackPipeline(source: Buffer, extension: string) {
  const pipeline = sharp(source).rotate();

  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return pipeline.jpeg({ progressive: true, quality: 95 });
    case '.png':
      return pipeline.png({ compressionLevel: 9 });
    case '.webp':
      return pipeline.webp({ quality: 95 });
    case '.avif':
      return pipeline.avif({ quality: 80 });
    default:
      return pipeline;
  }
}

async function listFiles(directory: string, relativeDirectory = '') {
  const currentDirectory = path.join(directory, relativeDirectory);
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of [...entries].sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const relativePath = path.join(relativeDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(directory, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

async function readCache(
  filePath: string,
  configHash: string,
): Promise<CacheFile> {
  try {
    const cache = JSON.parse(await readFile(filePath, 'utf8')) as CacheFile;
    if (cache.version === cacheVersion && cache.configHash === configHash) {
      return cache;
    }
  } catch {
    // A missing or invalid cache is equivalent to a cold build.
  }

  return { configHash, records: {}, version: cacheVersion };
}

async function recordFilesExist(directory: string, files: string[]) {
  try {
    await Promise.all(files.map((file) => access(path.join(directory, file))));
    return true;
  } catch {
    return false;
  }
}

async function copyRecordFiles(
  sourceDirectory: string,
  outputDirectory: string,
  files: string[],
) {
  for (const file of files) {
    const outputPath = path.join(outputDirectory, file);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await copyFile(path.join(sourceDirectory, file), outputPath);
  }
}

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}
