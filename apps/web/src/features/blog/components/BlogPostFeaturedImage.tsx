import ContentImage from 'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;640;760;1280;1520';
import type { Post } from 'content-collections';
import type { ComponentPropsWithoutRef } from 'react';
import { ImageLightboxTrigger } from '@/components/ui/ImageLightbox/ImageLightboxTrigger';
import { createBlogPostFeaturedImageSizes } from '@/features/blog/utils/createBlogPostFeaturedImageSizes';
import { cn } from '@/utils/classNames';

export type BlogPostFeaturedImageProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  src: Post['featuredImage'];
  title: Post['title'];
};

export function BlogPostFeaturedImage({
  className,
  src,
  title,
  ...props
}: BlogPostFeaturedImageProps) {
  if (!src) {
    return null;
  }

  return (
    <div {...props} className={cn('mb-8 flex justify-center', className)}>
      <ImageLightboxTrigger
        alt={title}
        className="block max-w-full"
        originalSrc={src}
      >
        <ContentImage
          src={src}
          alt={title}
          fetchPriority="high"
          loading="eager"
          pictureProps={{ className: 'max-w-full' }}
          sizes={createBlogPostFeaturedImageSizes}
          className="max-h-[400px] w-auto max-w-full object-contain"
        />
      </ImageLightboxTrigger>
    </div>
  );
}
