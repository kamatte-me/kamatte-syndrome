import ContentImage from 'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=72;120;144;240';
import { Link } from '@tanstack/react-router';
import avatarImage from '@/assets/avatar.svg';
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
        className="flex gap-4 border border-cutout-hole p-4 sm:gap-6 sm:p-6"
      >
        <div className="size-18 shrink-0 overflow-hidden sm:size-30">
          <ContentImage
            src={post.featuredImage || avatarImage}
            alt={post.title}
            width={120}
            height={120}
            loading="lazy"
            sizes="(min-width: 640px) 120px, 72px"
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-lg leading-snug sm:text-2xl">
            {post.title}
          </h2>
          <div className="mt-2 text-cutout-muted text-sm">
            {formatPostDate(post.publishedAt)}
          </div>
        </div>
      </Link>
    </li>
  );
}
