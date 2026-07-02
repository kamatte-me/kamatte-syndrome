import { Link } from '@tanstack/react-router';
import { formatPostDate } from '@/utils/posts';
import type { BlogListPost } from '../types';

export type BlogPostCardProps = {
  post: BlogListPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <li>
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="flex gap-4 border border-cutout-hole p-5 sm:gap-6 sm:p-6"
      >
        <div className="size-20 shrink-0 overflow-hidden border border-cutout-hole sm:size-[120px]">
          <img
            src={post.featuredImage ?? '/avatar.svg'}
            alt={post.title}
            width={120}
            height={120}
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-2xl leading-snug">{post.title}</h2>
          <div className="mt-2 text-cutout-muted text-sm">
            {formatPostDate(post.publishedAt)}
          </div>
        </div>
      </Link>
    </li>
  );
}
