import type { Post } from 'content-collections';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';
import { formatPostDate } from '@/utils/posts';

export type BlogPostHeaderProps = Omit<
  ComponentPropsWithoutRef<'header'>,
  'children'
> & {
  publishedAt: Post['publishedAt'];
  title: Post['title'];
};

export function BlogPostHeader({
  className,
  publishedAt,
  title,
  ...props
}: BlogPostHeaderProps) {
  return (
    <header
      {...props}
      className={cn('mb-8 border-cutout-hole border-b pb-6', className)}
    >
      <h1 className="font-bold text-4xl leading-tight sm:text-5xl">{title}</h1>
      <div className="mt-4 text-cutout-muted text-sm">
        {formatPostDate(publishedAt)}
      </div>
    </header>
  );
}
