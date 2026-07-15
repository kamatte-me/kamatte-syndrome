const featuredImageMaxHeight = 400;
const featuredImageMaxWidth = 760;

type ImageDimensions = Readonly<{
  height: number;
  width: number;
}>;

export function createBlogPostFeaturedImageSizes({
  height,
  width,
}: ImageDimensions) {
  const maxRenderedWidth = Math.ceil(
    Math.min(width, (width / height) * featuredImageMaxHeight),
  );

  return [
    `(max-width: 639px) min(calc(100vw - 4rem), ${maxRenderedWidth}px)`,
    `(max-width: 767px) min(calc(100vw - 10.125rem), ${maxRenderedWidth}px)`,
    `(max-width: 935px) min(calc(100vw - 11.125rem), ${maxRenderedWidth}px)`,
    `min(${featuredImageMaxWidth}px, ${maxRenderedWidth}px)`,
  ].join(', ');
}
