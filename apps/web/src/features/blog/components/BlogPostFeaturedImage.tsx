import blogFeaturedImageVariants from 'virtual:image-variants?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;640;760;1280;1520';
import type { Post } from 'content-collections';
import type { ComponentPropsWithoutRef } from 'react';
import { ContentImage } from '@/components/ui/ContentImage';
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
        loading="eager"
        manifest={blogFeaturedImageVariants}
        pictureProps={{ className: 'max-w-full' }}
        sizes="(max-width: 896px) calc(100vw - 3rem), 760px"
        className="max-h-[400px] max-w-full object-contain"
      />
    </div>
  );
}
