import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';

export type BlogPostArticleProps = ComponentPropsWithoutRef<'article'>;

export function BlogPostArticle({ className, ...props }: BlogPostArticleProps) {
  return (
    <article
      {...props}
      className={cn('border border-cutout-hole p-7 sm:p-9', className)}
    />
  );
}
