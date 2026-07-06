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
      className={cn('mb-8 border-cutout-hole border-b-4 pb-5', className)}
    >
      <h1 className="font-bold text-3xl leading-tight sm:text-4xl">{title}</h1>
      <div className="mt-3 text-cutout-muted text-sm">
        {formatPostDate(publishedAt)}
      </div>
    </header>
  );
}
