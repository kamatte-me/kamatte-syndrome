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
      className={cn('flex items-center justify-center gap-5', className)}
    >
      {hasPrevious ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage - 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="前のページ"
          className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole hover:text-cutout-hole"
        >
          <Icon className="size-[22px]" src={leftIcon} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-muted">
          <Icon className="size-[22px]" src={leftIcon} />
        </span>
      )}

      <p className="min-w-20 text-center font-semibold text-cutout-hole">
        <span className="text-2xl">{currentPage}</span>
        <span className="ml-1 text-cutout-muted text-sm">/ {totalPages}</span>
      </p>

      {hasNext ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage + 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="次のページ"
          className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole hover:text-cutout-hole"
        >
          <Icon className="size-[22px]" src={rightIcon} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-muted">
          <Icon className="size-[22px]" src={rightIcon} />
        </span>
      )}
    </nav>
  );
}
