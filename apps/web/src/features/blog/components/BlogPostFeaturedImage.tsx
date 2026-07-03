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
      <img
        src={src}
        alt={title}
        className="max-h-[400px] max-w-full object-contain"
      />
    </div>
  );
}
