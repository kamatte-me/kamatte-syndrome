import { ImageLightboxTrigger } from '@/components/ui/ImageLightbox/ImageLightboxTrigger';
import {
  MarkdownContentImage,
  type MarkdownContentImageProps,
} from '@/components/ui/MarkdownContentImage';

export type BlogPostContentImageProps = MarkdownContentImageProps & {
  lightboxDisabled?: boolean;
};

export function BlogPostContentImage({
  alt,
  lightboxDisabled = false,
  src,
  ...props
}: BlogPostContentImageProps) {
  const hasOriginalSrc = typeof src === 'string' && src.trim().length > 0;
  const imageSrc = typeof src === 'string' && !hasOriginalSrc ? undefined : src;
  const image = <MarkdownContentImage {...props} src={imageSrc} alt={alt} />;

  if (!hasOriginalSrc || lightboxDisabled) {
    return image;
  }

  return (
    <ImageLightboxTrigger
      alt={alt}
      originalSrc={src}
      className="mx-auto my-[2em] block w-fit [&>picture]:block [&>picture]:max-w-full [&_img]:my-0 [&_picture]:my-0"
    >
      {image}
    </ImageLightboxTrigger>
  );
}
