import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';

export type BlogPostArticleProps = ComponentPropsWithoutRef<'article'>;

export function BlogPostArticle({ className, ...props }: BlogPostArticleProps) {
  return (
    <article
      {...props}
      className={cn('sm:border sm:border-cutout-hole sm:p-7 md:p-9', className)}
    />
  );
}
