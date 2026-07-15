import ContentImage from 'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;640;760;1280;1520';
import type { Post } from 'content-collections';
import type { ComponentPropsWithoutRef } from 'react';
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
      <ContentImage
        src={src}
        alt={title}
        fetchPriority="high"
        loading="eager"
        pictureProps={{ className: 'max-w-full' }}
        sizes="(max-width: 639px) calc(100vw - 4rem), (max-width: 767px) calc(100vw - 10.125rem), (max-width: 935px) calc(100vw - 11.125rem), 760px"
        className="max-h-[400px] max-w-full object-contain"
      />
    </div>
  );
}
