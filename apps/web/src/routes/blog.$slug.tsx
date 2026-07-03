import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPosts } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { BlogPostArticle } from '@/features/blog/components/BlogPostArticle';
import { BlogPostFeaturedImage } from '@/features/blog/components/BlogPostFeaturedImage';
import { BlogPostHeader } from '@/features/blog/components/BlogPostHeader';
import { BlogPostNavigation } from '@/features/blog/components/BlogPostNavigation';
import type { BlogAdjacentPost } from '@/features/blog/types';
import { LinkCard } from '@/features/url-embeds/components/LinkCard';
import { OEmbed } from '@/features/url-embeds/components/OEmbed';
import { sortPostsByPublishedAtDesc } from '@/utils/posts';

function toAdjacentPost(
  post: (typeof allPosts)[number] | undefined,
): BlogAdjacentPost | null {
  if (!post) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
  };
}

const getPostBySlugServerFn = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
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
    <PageMain size="narrow">
      <BlogPostArticle>
        <BlogPostHeader publishedAt={post.publishedAt} title={post.title} />
        <BlogPostFeaturedImage src={post.featuredImage} title={post.title} />
        <MarkdownContent>{post.mdx}</MarkdownContent>
        <BlogPostNavigation next={post.nextPost} previous={post.previousPost} />
      </BlogPostArticle>
    </PageMain>
  );
}
