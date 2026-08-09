import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  getSharpEncoderVersion,
  readCachedAsset,
  writeCachedAsset,
} from '@kamatte-syndrome/image-optimization-core';
import sharp from 'sharp';

export type ImageVariantFormatOptions = Readonly<{
  /** Compression effort. AVIF accepts 0-9 and WebP accepts 0-6. */
  effort?: number;
  /** Output quality from 1 to 100. */
  quality?: number;
}>;

export type ResolvedImageVariantFormatOptions = Readonly<{
  effort?: number;
  quality: number;
}>;

export type ImageVariantFormatSettings = Readonly<{
  avif: ResolvedImageVariantFormatOptions;
  webp: ResolvedImageVariantFormatOptions;
}>;

export const defaultImageVariantFormatSettings = {
  avif: { quality: 60 },
  webp: { quality: 80 },
} as const satisfies ImageVariantFormatSettings;

export type ImageVariantWidths = Readonly<{
  avif: readonly number[];
  webp: readonly number[];
}>;

export type RequestedImageVariantWidth = number | 'original';

export type GeneratedImageVariant = Readonly<{
  buffer: Buffer;
  cacheKey: string;
  format: 'avif' | 'webp';
  height: number;
  width: number;
}>;

export type GeneratedImageVariants = Readonly<{
  avif: readonly GeneratedImageVariant[];
  webp: readonly GeneratedImageVariant[];
}>;

type CachedImageVariantMetadata = Readonly<{
  format: 'avif' | 'webp';
  height: number;
  width: number;
}>;

const transformedImagePromises = new Map<
  string,
  Promise<GeneratedImageVariant>
>();
const maxCachedTransformedImages = 1_000;
const transformedImageCacheSchemaVersion = 1;
const transformedImageEncoderVersion = getSharpEncoderVersion();

export function resolveImageVariantFormatSettings({
  avif,
  webp,
}: Readonly<{
  avif?: ImageVariantFormatOptions;
  webp?: ImageVariantFormatOptions;
}> = {}): ImageVariantFormatSettings {
  return {
    avif: resolveImageVariantFormatOptions(
      'avif',
      avif,
      defaultImageVariantFormatSettings.avif.quality,
    ),
    webp: resolveImageVariantFormatOptions(
      'webp',
      webp,
      defaultImageVariantFormatSettings.webp.quality,
    ),
  };
}

export function clampImageWidths(
  widths: readonly RequestedImageVariantWidth[],
  naturalWidth: number,
) {
  return [
    ...new Set(
      widths.map((width) =>
        width === 'original' ? naturalWidth : Math.min(width, naturalWidth),
      ),
    ),
  ].sort((a, b) => a - b);
}

/**
 * Generates the responsive assets themselves, retaining only variants smaller
 * than the original source. Results are persisted so Vite does not need an
 * image-transform plugin to recreate them in subsequent builds.
 */
export async function generateImageVariants({
  cacheDirectory,
  formatSettings = defaultImageVariantFormatSettings,
  lossless = false,
  sourcePath,
  widths,
}: Readonly<{
  cacheDirectory?: string;
  formatSettings?: ImageVariantFormatSettings;
  lossless?: boolean;
  sourcePath: string;
  widths: readonly RequestedImageVariantWidth[];
}>): Promise<GeneratedImageVariants> {
  const source = await readFile(sourcePath);
  const metadata = await sharp(source).metadata();
  if ((metadata.pages ?? 1) > 1) {
    return { avif: [], webp: [] };
  }

  const naturalWidth = metadata.autoOrient.width;
  if (!naturalWidth) {
    throw new Error(`Image width is unavailable: ${sourcePath}`);
  }

  const sourceHash = createHash('sha256').update(source).digest('hex');
  const candidateWidths = clampImageWidths(widths, naturalWidth);
  const [avif, webp] = await Promise.all([
    lossless
      ? Promise.resolve([])
      : generateSmallerVariants({
          cacheDirectory,
          format: 'avif',
          options: formatSettings.avif,
          source,
          sourceHash,
          widths: candidateWidths,
        }),
    generateSmallerVariants({
      cacheDirectory,
      format: 'webp',
      lossless,
      options: formatSettings.webp,
      source,
      sourceHash,
      widths: candidateWidths,
    }),
  ]);

  return { avif, webp };
}

/** Retained as a small, public selection helper for callers that only need widths. */
export async function selectImageVariantWidths(
  options: Parameters<typeof generateImageVariants>[0],
): Promise<ImageVariantWidths> {
  const variants = await generateImageVariants(options);
  return {
    avif: variants.avif.map(({ width }) => width),
    webp: variants.webp.map(({ width }) => width),
  };
}

async function generateSmallerVariants({
  cacheDirectory,
  format,
  lossless = false,
  options,
  source,
  sourceHash,
  widths,
}: Readonly<{
  cacheDirectory?: string;
  format: 'avif' | 'webp';
  lossless?: boolean;
  options: ResolvedImageVariantFormatOptions;
  source: Buffer;
  sourceHash: string;
  widths: readonly number[];
}>) {
  const variants = await Promise.all(
    widths.map((width) =>
      getGeneratedImageVariant({
        cacheDirectory,
        format,
        lossless,
        options,
        source,
        sourceHash,
        width,
      }),
    ),
  );
  return variants.filter(
    (variant): variant is GeneratedImageVariant =>
      variant.buffer.byteLength < source.byteLength,
  );
}

function getGeneratedImageVariant({
  cacheDirectory,
  format,
  lossless,
  options,
  source,
  sourceHash,
  width,
}: Readonly<{
  cacheDirectory?: string;
  format: 'avif' | 'webp';
  lossless: boolean;
  options: ResolvedImageVariantFormatOptions;
  source: Buffer;
  sourceHash: string;
  width: number;
}>) {
  const cacheKey = createTransformedImageCacheKey({
    format,
    lossless,
    options,
    sourceHash,
    width,
  });
  const memoryKey = `${cacheDirectory ?? ''}\0${cacheKey}`;
  const cached = transformedImagePromises.get(memoryKey);
  if (cached) {
    return cached;
  }

  const transformation = readCachedImageVariant({
    cacheDirectory,
    cacheKey,
    format,
  })
    .then(async (cachedVariant) => {
      if (cachedVariant) {
        return { ...cachedVariant, cacheKey };
      }

      const buffer = await sharp(source)
        .autoOrient()
        .toFormat(format, {
          effort: options.effort,
          lossless: lossless ? true : undefined,
          quality: lossless ? undefined : options.quality,
        })
        .resize({ width, withoutEnlargement: true })
        .toBuffer();
      const metadata = await sharp(buffer).metadata();
      const generatedWidth = metadata.width;
      const generatedHeight = metadata.height;
      if (!generatedWidth || !generatedHeight) {
        throw new Error('Generated image dimensions are unavailable');
      }
      const generated = {
        buffer,
        cacheKey,
        format,
        height: generatedHeight,
        width: generatedWidth,
      } satisfies GeneratedImageVariant;
      await writeCachedImageVariant({
        cacheDirectory,
        cacheKey,
        generated,
      });
      return generated;
    })
    .catch((error: unknown) => {
      transformedImagePromises.delete(memoryKey);
      throw error;
    });
  transformedImagePromises.set(memoryKey, transformation);
  if (transformedImagePromises.size > maxCachedTransformedImages) {
    const oldestKey = transformedImagePromises.keys().next().value;
    if (oldestKey) {
      transformedImagePromises.delete(oldestKey);
    }
  }
  return transformation;
}

function createTransformedImageCacheKey({
  format,
  lossless,
  options,
  sourceHash,
  width,
}: Readonly<{
  format: 'avif' | 'webp';
  lossless: boolean;
  options: ResolvedImageVariantFormatOptions;
  sourceHash: string;
  width: number;
}>) {
  const quality = lossless ? undefined : options.quality;
  return createHash('sha256')
    .update(
      `${transformedImageCacheSchemaVersion}\0${transformedImageEncoderVersion}\0${sourceHash}\0${format}\0${quality ?? ''}\0${options.effort ?? ''}\0${String(lossless)}\0${width}`,
    )
    .digest('hex');
}

async function readCachedImageVariant({
  cacheDirectory,
  cacheKey,
  format,
}: Readonly<{
  cacheDirectory: string | undefined;
  cacheKey: string;
  format: 'avif' | 'webp';
}>) {
  if (!cacheDirectory) {
    return undefined;
  }

  const cached = await readCachedAsset({
    cacheDirectory,
    cacheKey,
    fileExtension: format,
    parseMetadata(metadata) {
      return isCachedImageVariantMetadata(metadata, format)
        ? metadata
        : undefined;
    },
  });
  return cached ? { buffer: cached.buffer, ...cached.metadata } : undefined;
}

async function writeCachedImageVariant({
  cacheDirectory,
  cacheKey,
  generated,
}: Readonly<{
  cacheDirectory: string | undefined;
  cacheKey: string;
  generated: GeneratedImageVariant;
}>) {
  if (!cacheDirectory) {
    return;
  }

  const metadata = {
    format: generated.format,
    height: generated.height,
    width: generated.width,
  } satisfies CachedImageVariantMetadata;
  try {
    await writeCachedAsset({
      buffer: generated.buffer,
      cacheDirectory,
      cacheKey,
      fileExtension: generated.format,
      metadata,
    });
  } catch {
    // A cache write failure must not prevent image generation.
  }
}

function isCachedImageVariantMetadata(
  metadata: unknown,
  format: 'avif' | 'webp',
): metadata is CachedImageVariantMetadata {
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

function resolveImageVariantFormatOptions(
  format: 'avif' | 'webp',
  options: ImageVariantFormatOptions | undefined,
  defaultQuality: number,
): ResolvedImageVariantFormatOptions {
  const quality = options?.quality ?? defaultQuality;
  assertIntegerInRange(`${format}.quality`, quality, 1, 100);
  const effort = options?.effort;
  if (effort !== undefined) {
    assertIntegerInRange(
      `${format}.effort`,
      effort,
      0,
      format === 'avif' ? 9 : 6,
    );
  }

  return {
    quality,
    ...(effort === undefined ? {} : { effort }),
  };
}

function assertIntegerInRange(
  option: string,
  value: number,
  minimum: number,
  maximum: number,
) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `optimizedResponsiveImage ${option} must be an integer between ${minimum} and ${maximum}: ${String(value)}`,
    );
  }
}
