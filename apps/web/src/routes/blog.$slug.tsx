import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import type { Post } from 'content-collections';
import { ArticleLayout } from '@/components/layouts/ArticleLayout';
import { PageMain } from '@/components/layouts/PageMain';
import { MarkdownContentImage } from '@/components/ui/MarkdownContentImage';
import { slogan } from '@/constants/site';
import { BlogPostBody } from '@/features/blog/components/BlogPostBody';
import { BlogPostFeaturedImage } from '@/features/blog/components/BlogPostFeaturedImage';
import { BlogPostNavigation } from '@/features/blog/components/BlogPostNavigation';
import { getPosts } from '@/features/blog/server/getPosts.server';
import type { BlogAdjacentPost } from '@/features/blog/types';
import {
  createBlogBreadcrumbStructuredData,
  createBlogPostingStructuredData,
} from '@/features/blog/utils/jsonLd';
import {
  LinkCard,
  type LinkCardProps,
} from '@/features/url-embeds/components/LinkCard';
import {
  OEmbed,
  type OEmbedProps,
} from '@/features/url-embeds/components/OEmbed';
import { cn } from '@/utils/classNames';
import { createJsonLdScript } from '@/utils/jsonLd';
import {
  createCanonicalLink,
  createPageMeta,
  formatPageTitle,
} from '@/utils/pageMeta';
import { createPostDescription, formatPostDate } from '@/utils/posts';

function toAdjacentPost(post: Post | undefined): BlogAdjacentPost | null {
  if (!post) {
    return null;
  }

  return {
    slug: post.slug,
    title: post.title,
  };
}

function BlogPostLinkCard({ className, ...props }: LinkCardProps) {
  return <LinkCard {...props} className={cn('my-6', className)} />;
}

function BlogPostOEmbed({ className, ...props }: OEmbedProps) {
  return (
    <OEmbed
      {...props}
      className={cn('mx-auto my-6 max-w-[576px]', className)}
    />
  );
}

const getPostBySlugServerFn = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const posts = getPosts();
    const currentIndex = posts.findIndex((post) => post.slug === slug);
    const post = posts[currentIndex];

    if (!post) {
      throw notFound();
    }

    const { content, mdx: MDXContent, ...postData } = post;

    return {
      ...postData,
      description: createPostDescription(content),
      mdx: await renderServerComponent(
        <MDXContent
          components={{
            img: MarkdownContentImage,
            LinkCard: BlogPostLinkCard,
            OEmbed: BlogPostOEmbed,
          }}
        />,
      ),
      previousPost: toAdjacentPost(posts[currentIndex + 1]),
      nextPost: toAdjacentPost(posts[currentIndex - 1]),
    };
  });

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params: { slug } }) => getPostBySlugServerFn({ data: slug }),
  head: ({ loaderData }) => {
    const post = loaderData;

    if (!post) {
      return {};
    }

    const path = `/blog/${post.slug}`;

    return {
      links: [createCanonicalLink(path)],
      meta: createPageMeta({
        title: formatPageTitle(post.title),
        openGraphTitle: post.title,
        description: post.description ?? slogan,
        path,
        image: post.featuredImage,
        type: 'article',
      }),
      scripts: [
        createJsonLdScript(createBlogPostingStructuredData(post)),
        createJsonLdScript(createBlogBreadcrumbStructuredData(post)),
      ],
    };
  },
  component: PostDetailPage,
});

function PostDetailPage() {
  const post = Route.useLoaderData();

  return (
    <PageMain size="narrow">
      <ArticleLayout
        metadata={formatPostDate(post.publishedAt)}
        title={post.title}
      >
        <BlogPostFeaturedImage src={post.featuredImage} title={post.title} />
        <BlogPostBody>{post.mdx}</BlogPostBody>
        <BlogPostNavigation next={post.nextPost} previous={post.previousPost} />
      </ArticleLayout>
    </PageMain>
  );
}
