import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { allPosts } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { formatPageTitle } from '@/constants/site';
import { BlogPagination } from '@/features/blog/components/BlogPagination';
import { BlogPostCard } from '@/features/blog/components/BlogPostCard';
import { BlogPostList } from '@/features/blog/components/BlogPostList';
import type { BlogListPost } from '@/features/blog/types';
import {
  paginateItems,
  parseBlogPageSearchParam,
  sortPostsByPublishedAtDesc,
} from '@/utils/posts';

type BlogIndexInput = {
  page: number;
};

type BlogSearch = {
  page?: number;
};

function validateBlogSearch(search: Record<string, unknown>): BlogSearch {
  return {
    page: parseBlogPageSearchParam(search.page),
  };
}

function hasPageSearchParam(searchStr: string) {
  return new URLSearchParams(searchStr).has('page');
}

const getBlogIndex = createServerFn({ method: 'GET' })
  .validator((input: BlogIndexInput) => input)
  .handler(async ({ data: { page } }) => {
    const posts: BlogListPost[] = sortPostsByPublishedAtDesc(allPosts).map(
      ({ featuredImage, publishedAt, slug, title }) => ({
        featuredImage,
        publishedAt,
        slug,
        title,
      }),
    );
    const { items, pageInfo } = paginateItems(posts, page);

    if (page > pageInfo.totalPages) {
      throw notFound();
    }

    return {
      posts: items,
      pageInfo,
    };
  });

export const Route = createFileRoute('/blog/')({
  validateSearch: validateBlogSearch,
  beforeLoad: ({ location, search }) => {
    if (hasPageSearchParam(location.searchStr) && !search.page) {
      throw redirect({
        to: '/blog',
        replace: true,
      });
    }
  },
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
  }),
  loader: async ({ deps: { page } }) => getBlogIndex({ data: { page } }),
  head: () => ({ meta: [{ title: formatPageTitle('Blog') }] }),
  component: BlogPage,
});

function BlogPage() {
  const { pageInfo, posts } = Route.useLoaderData();

  return (
    <PageMain size="narrow">
      <PageTitle>Blog</PageTitle>

      <div className="grid gap-8">
        <BlogPostList>
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </BlogPostList>

        <BlogPagination
          currentPage={pageInfo.currentPage}
          totalPages={pageInfo.totalPages}
        />
      </div>
    </PageMain>
  );
}
