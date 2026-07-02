import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';

export type BlogPostListProps = ComponentPropsWithoutRef<'ul'>;

export function BlogPostList({ className, ...props }: BlogPostListProps) {
  return <ul {...props} className={cn('grid gap-5', className)} />;
}
