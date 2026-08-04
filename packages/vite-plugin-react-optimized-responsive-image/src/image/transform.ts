import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
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
  formatSettings = defaultImageVariantFormatSettings,
  lossless = false,
  sourcePath,
  widths,
}: Readonly<{
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
          options: formatSettings.avif,
          source,
          sourceHash,
          widths: candidateWidths,
        }),
    selectSmallerWidths({
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

async function selectSmallerWidths({
  format,
  lossless = false,
  options,
  source,
  sourceHash,
  widths,
}: Readonly<{
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
  format,
  lossless,
  options,
  source,
  sourceHash,
  width,
}: Readonly<{
  format: 'avif' | 'webp';
  lossless: boolean;
  options: ResolvedImageVariantFormatOptions;
  source: Buffer;
  sourceHash: string;
  width: number;
}>) {
  const quality = lossless ? undefined : options.quality;
  const cacheKey = `${sourceHash}\0${format}\0${quality ?? ''}\0${options.effort ?? ''}\0${String(lossless)}\0${width}`;
  const cachedSize = variantSizePromises.get(cacheKey);
  if (cachedSize) {
    return cachedSize;
  }

  const size = sharp(source)
    .autoOrient()
    .toFormat(format, {
      effort: options.effort,
      lossless: lossless ? true : undefined,
      quality,
    })
    .resize({ width, withoutEnlargement: true })
    .toBuffer()
    .then((buffer) => buffer.byteLength)
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
