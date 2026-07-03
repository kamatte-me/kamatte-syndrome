import { Link } from '@tanstack/react-router';
import leftIcon from '@/assets/icons/left_fill.svg';
import rightIcon from '@/assets/icons/right_fill.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/classNames';
import type { BlogAdjacentPost } from '../types';

export type AdjacentBlogPostLinkProps = {
  direction: 'previous' | 'next';
  post: BlogAdjacentPost;
};

export function AdjacentBlogPostLink({
  direction,
  post,
}: AdjacentBlogPostLinkProps) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? '前の記事' : '次の記事';
  const iconUrl = isPrevious ? leftIcon : rightIcon;

  return (
    <Link
      aria-label={`${label}: ${post.title}`}
      className="group inline-flex h-full max-w-full items-start gap-2 text-cutout-hole hover:text-cutout-hole sm:gap-3"
      params={{ slug: post.slug }}
      to="/blog/$slug"
    >
      {isPrevious ? (
        <Icon className="size-5 self-center" src={iconUrl} />
      ) : null}
      <span className={cn('min-w-0', !isPrevious && 'text-right')}>
        <span className="block text-cutout-muted text-xs">{label}</span>
        <span className="block font-medium text-sm [overflow-wrap:anywhere] group-hover:underline sm:text-base">
          {post.title}
        </span>
      </span>
      {!isPrevious ? (
        <Icon className="size-5 self-center" src={iconUrl} />
      ) : null}
    </Link>
  );
}
