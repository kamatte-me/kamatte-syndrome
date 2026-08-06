import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const imageTransformQueryParameter = '__imageVariants';

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

const variantSizePromises = new Map<string, Promise<number>>();
const maxCachedVariantSizes = 1_000;
const variantSizeCacheSchemaVersion = 1;
const variantSizeEncoderVersion = Object.entries(sharp.versions)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, version]) => `${name}:${version}`)
  .join('\0');

export function createImageTransformImport(
  sourcePath: string,
  directives: Record<string, string>,
) {
  const parameters = new URLSearchParams({
    [imageTransformQueryParameter]: 'true',
    ...directives,
  });

  return `${sourcePath}?${parameters}`;
}

export function createImageVariantFormatDirectives({
  format,
  lossless = false,
  options,
}: Readonly<{
  format: 'avif' | 'webp';
  lossless?: boolean;
  options: ResolvedImageVariantFormatOptions;
}>) {
  return {
    format,
    ...(lossless ? { lossless: 'true' } : { quality: String(options.quality) }),
    ...(options.effort === undefined ? {} : { effort: String(options.effort) }),
  };
}

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

export async function selectImageVariantWidths({
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
}>): Promise<ImageVariantWidths> {
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
      : selectSmallerWidths({
          format: 'avif',
          cacheDirectory,
          options: formatSettings.avif,
          source,
          sourceHash,
          widths: candidateWidths,
        }),
    selectSmallerWidths({
      format: 'webp',
      cacheDirectory,
      lossless,
      options: formatSettings.webp,
      source,
      sourceHash,
      widths: candidateWidths,
    }),
  ]);

  return { avif, webp };
}

async function selectSmallerWidths({
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
  const candidates = await Promise.all(
    widths.map(async (width) => {
      const size = await getVariantSize({
        cacheDirectory,
        format,
        lossless,
        options,
        source,
        sourceHash,
        width,
      });
      return size < source.byteLength ? width : null;
    }),
  );

  return candidates.filter((width): width is number => width !== null);
}

function getVariantSize({
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
  const quality = lossless ? undefined : options.quality;
  const variantSizeKey = `${variantSizeCacheSchemaVersion}\0${variantSizeEncoderVersion}\0${sourceHash}\0${format}\0${quality ?? ''}\0${options.effort ?? ''}\0${String(lossless)}\0${width}`;
  const cacheKey = `${cacheDirectory ?? ''}\0${variantSizeKey}`;
  const cachedSize = variantSizePromises.get(cacheKey);
  if (cachedSize) {
    return cachedSize;
  }

  const size = readVariantSizeFromCache({
    cacheDirectory,
    variantSizeKey,
  })
    .then(async (cachedVariantSize) => {
      if (cachedVariantSize !== undefined) {
        return cachedVariantSize;
      }

      const variantSize = (
        await sharp(source)
          .autoOrient()
          .toFormat(format, {
            effort: options.effort,
            lossless: lossless ? true : undefined,
            quality,
          })
          .resize({ width, withoutEnlargement: true })
          .toBuffer()
      ).byteLength;
      await writeVariantSizeToCache({
        cacheDirectory,
        variantSize,
        variantSizeKey,
      });
      return variantSize;
    })
    .catch((error: unknown) => {
      variantSizePromises.delete(cacheKey);
      throw error;
    });
  variantSizePromises.set(cacheKey, size);
  if (variantSizePromises.size > maxCachedVariantSizes) {
    const oldestKey = variantSizePromises.keys().next().value;
    if (oldestKey) {
      variantSizePromises.delete(oldestKey);
    }
  }
  return size;
}

async function readVariantSizeFromCache({
  cacheDirectory,
  variantSizeKey,
}: Readonly<{
  cacheDirectory: string | undefined;
  variantSizeKey: string;
}>) {
  if (!cacheDirectory) {
    return undefined;
  }

  try {
    const value = await readFile(
      createVariantSizeCachePath(cacheDirectory, variantSizeKey),
      'utf8',
    );
    const variantSize = Number(value);
    return Number.isSafeInteger(variantSize) &&
      variantSize > 0 &&
      String(variantSize) === value
      ? variantSize
      : undefined;
  } catch {
    return undefined;
  }
}

async function writeVariantSizeToCache({
  cacheDirectory,
  variantSize,
  variantSizeKey,
}: Readonly<{
  cacheDirectory: string | undefined;
  variantSize: number;
  variantSizeKey: string;
}>) {
  if (!cacheDirectory) {
    return;
  }

  const cachePath = createVariantSizeCachePath(cacheDirectory, variantSizeKey);
  const temporaryPath = `${cachePath}.${process.pid}-${randomUUID()}.tmp`;
  try {
    await mkdir(cacheDirectory, { recursive: true });
    await writeFile(temporaryPath, String(variantSize));
    await rename(temporaryPath, cachePath);
  } catch {
    // A cache write failure must not prevent image generation.
  } finally {
    try {
      await rm(temporaryPath, { force: true });
    } catch {
      // A failed cleanup only leaves an unused temporary cache file.
    }
  }
}

function createVariantSizeCachePath(
  cacheDirectory: string,
  variantSizeKey: string,
) {
  return path.join(
    cacheDirectory,
    createHash('sha256').update(variantSizeKey).digest('hex'),
  );
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
