export const imageTransformQueryParameter = '__imageVariants';

export const imageVariantAvifQuality = 60;
export const imageVariantWebpQuality = 80;

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
