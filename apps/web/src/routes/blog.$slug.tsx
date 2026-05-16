import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPosts } from 'content-collections';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { LinkCard } from '@/features/url-embeds/components/LinkCard';
import { OEmbed } from '@/features/url-embeds/components/OEmbed';
import { cn } from '@/utils/classNames';
import { formatPostDate, sortPostsByPublishedAtDesc } from '@/utils/posts';

type AdjacentPost = {
  slug: string;
  title: string;
};

function toAdjacentPost(
  post: (typeof allPosts)[number] | undefined,
): AdjacentPost | null {
  if (!post) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
  };
}

const getPostBySlugServerFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const posts = sortPostsByPublishedAtDesc(allPosts);
    const currentIndex = posts.findIndex((post) => post.slug === slug);
    const post = posts[currentIndex];

    if (!post) {
      throw notFound();
    }

    const MDXContent = post.mdx;

    return {
      ...post,
      mdx: await renderServerComponent(
        <MDXContent components={{ LinkCard, OEmbed }} />,
      ),
      previousPost: toAdjacentPost(posts[currentIndex + 1]),
      nextPost: toAdjacentPost(posts[currentIndex - 1]),
    };
  });

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params: { slug } }) => getPostBySlugServerFn({ data: slug }),
  component: PostDetailPage,
  pendingComponent: () => <div>Loading...</div>,
});

function PostDetailPage() {
  const post = Route.useLoaderData();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="flex items-center gap-3 text-cutout-hole text-sm">
        <Link
          to="/blog"
          className="rounded-full border border-cutout-hole px-4 py-1.5 hover:text-cutout-hole"
        >
          Back to Blog
        </Link>
      </div>

      <article className="border border-cutout-hole p-7 sm:p-9">
        <header className="mb-8 border-cutout-hole border-b pb-6">
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 text-cutout-muted text-sm">
            {formatPostDate(post.publishedAt)}
          </div>
        </header>

        {post.featuredImage ? (
          <div className="mb-8 flex justify-center">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="max-h-[400px] max-w-full object-contain"
            />
          </div>
        ) : null}

        <MarkdownContent>{post.mdx}</MarkdownContent>

        <BlogEntryNavigation
          next={post.nextPost}
          previous={post.previousPost}
        />
      </article>
    </main>
  );
}

function BlogEntryNavigation({
  next,
  previous,
}: {
  next: AdjacentPost | null;
  previous: AdjacentPost | null;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="前後の記事"
      className="mt-10 grid grid-cols-2 gap-3 border-cutout-hole border-t pt-6 sm:gap-5"
    >
      <div className="flex min-w-0 items-start">
        {previous ? (
          <AdjacentPostLink direction="previous" post={previous} />
        ) : null}
      </div>
      <div className="flex min-w-0 items-start justify-end">
        {next ? <AdjacentPostLink direction="next" post={next} /> : null}
      </div>
    </nav>
  );
}

function AdjacentPostLink({
  direction,
  post,
}: {
  direction: 'previous' | 'next';
  post: AdjacentPost;
}) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? '前の記事' : '次の記事';
  const Icon = isPrevious ? ChevronLeft : ChevronRight;

  return (
    <Link
      aria-label={`${label}: ${post.title}`}
      className="group inline-flex h-full max-w-full items-start gap-2 text-cutout-hole hover:text-cutout-hole sm:gap-3"
      params={{ slug: post.slug }}
      to="/blog/$slug"
    >
      {isPrevious ? (
        <Icon aria-hidden="true" className="size-5 shrink-0 self-center" />
      ) : null}
      <span className={cn('min-w-0', !isPrevious && 'text-right')}>
        <span className="block text-cutout-muted text-xs">{label}</span>
        <span className="block font-medium text-sm [overflow-wrap:anywhere] group-hover:underline sm:text-base">
          {post.title}
        </span>
      </span>
      {!isPrevious ? (
        <Icon aria-hidden="true" className="size-5 shrink-0 self-center" />
      ) : null}
    </Link>
  );
}
