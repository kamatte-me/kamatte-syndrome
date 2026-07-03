import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/classNames';
import type { BlogAdjacentPost } from '../types';
import { AdjacentBlogPostLink } from './AdjacentBlogPostLink';

export type BlogPostNavigationProps = Omit<
  ComponentPropsWithoutRef<'nav'>,
  'children'
> & {
  next: BlogAdjacentPost | null;
  previous: BlogAdjacentPost | null;
};

export function BlogPostNavigation({
  className,
  next,
  previous,
  ...props
}: BlogPostNavigationProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      {...props}
      aria-label="前後の記事"
      className={cn(
        'mt-10 grid grid-cols-2 gap-3 border-cutout-hole border-t pt-6 sm:gap-5',
        className,
      )}
    >
      <div className="flex min-w-0 items-start">
        {previous ? (
          <AdjacentBlogPostLink direction="previous" post={previous} />
        ) : null}
      </div>
      <div className="flex min-w-0 items-start justify-end">
        {next ? <AdjacentBlogPostLink direction="next" post={next} /> : null}
      </div>
    </nav>
  );
}
