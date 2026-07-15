import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

export const imageTransformQueryParameter = '__imageVariants';

export const imageVariantAvifQuality = 60;
export const imageVariantWebpQuality = 80;

export type ImageVariantWidths = Readonly<{
  avif: readonly number[];
  webp: readonly number[];
}>;

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

export function clampImageWidths(
  widths: readonly number[],
  naturalWidth: number,
) {
  return [
    ...new Set(widths.map((width) => Math.min(width, naturalWidth))),
  ].sort((a, b) => a - b);
}

export async function selectImageVariantWidths({
  lossless = false,
  sourcePath,
  widths,
}: Readonly<{
  lossless?: boolean;
  sourcePath: string;
  widths: readonly number[];
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
          quality: imageVariantAvifQuality,
          source,
          sourceHash,
          widths: candidateWidths,
        }),
    selectSmallerWidths({
      format: 'webp',
      lossless,
      quality: imageVariantWebpQuality,
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
  quality,
  source,
  sourceHash,
  widths,
}: Readonly<{
  format: 'avif' | 'webp';
  lossless?: boolean;
  quality: number;
  source: Buffer;
  sourceHash: string;
  widths: readonly number[];
}>) {
  const candidates = await Promise.all(
    widths.map(async (width) => {
      const size = await getVariantSize({
        format,
        lossless,
        quality,
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
  quality,
  source,
  sourceHash,
  width,
}: Readonly<{
  format: 'avif' | 'webp';
  lossless: boolean;
  quality: number;
  source: Buffer;
  sourceHash: string;
  width: number;
}>) {
  const cacheKey = `${sourceHash}\0${format}\0${quality}\0${String(lossless)}\0${width}`;
  const cachedSize = variantSizePromises.get(cacheKey);
  if (cachedSize) {
    return cachedSize;
  }

  const size = sharp(source)
    .autoOrient()
    .toFormat(format, {
      lossless: lossless ? true : undefined,
      quality: lossless ? undefined : quality,
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
