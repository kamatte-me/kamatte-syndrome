import { Link } from '@tanstack/react-router';
import leftIcon from '@/assets/icons/left_fill.svg';
import rightIcon from '@/assets/icons/right_fill.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/classNames';

type BlogSearch = {
  page?: number;
};

export type BlogPaginationProps = {
  className?: string;
  currentPage: number;
  totalPages: number;
};

const paginationLinkActiveOptions = {
  exact: true,
  includeSearch: true,
};

const paginationControlClassName =
  'inline-flex size-11 items-center justify-center';

function getBlogPageSearch(page: number): BlogSearch {
  return page <= 1 ? {} : { page };
}

export function BlogPagination({
  className,
  currentPage,
  totalPages,
}: BlogPaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Blog pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {hasPrevious ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage - 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="前のページ"
          className={cn(
            paginationControlClassName,
            'text-cutout-hole hover:text-cutout-hole',
          )}
        >
          <Icon className="size-9 translate-y-1" src={leftIcon} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(paginationControlClassName, 'invisible')}
        />
      )}

      <p className="min-w-24 text-center font-bold font-display text-cutout-hole tabular-nums leading-none">
        <span className="text-4xl">{currentPage}</span>
        <span className="text-2xl text-cutout-muted">
          <span className="mx-1">/</span>
          {totalPages}
        </span>
      </p>

      {hasNext ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage + 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="次のページ"
          className={cn(
            paginationControlClassName,
            'text-cutout-hole hover:text-cutout-hole',
          )}
        >
          <Icon className="size-9 translate-y-1" src={rightIcon} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(paginationControlClassName, 'invisible')}
        />
      )}
    </nav>
  );
}
