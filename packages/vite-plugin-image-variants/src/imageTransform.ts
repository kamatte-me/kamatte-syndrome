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
