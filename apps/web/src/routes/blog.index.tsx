import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { allPosts } from 'content-collections';
import chevronLeftIconUrl from '@/assets/icons/chevron-left.svg';
import chevronRightIconUrl from '@/assets/icons/chevron-right.svg';
import { Icon } from '@/components/ui/Icon';
import {
  formatPostDate,
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

const paginationLinkActiveOptions = {
  exact: true,
  includeSearch: true,
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
  .inputValidator((input: BlogIndexInput) => input)
  .handler(async ({ data: { page } }) => {
    const posts = sortPostsByPublishedAtDesc(allPosts).map(
      ({ mdx: _mdx, content: _content, ...post }) => post,
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
  component: BlogPage,
});

function getBlogPageSearch(page: number): BlogSearch {
  return page <= 1 ? {} : { page };
}

function BlogPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Blog pagination"
      className="flex items-center justify-center gap-5"
    >
      {hasPrevious ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage - 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="前のページ"
          className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole hover:text-cutout-hole"
        >
          <Icon className="size-[22px]" src={chevronLeftIconUrl} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-muted">
          <Icon className="size-[22px]" src={chevronLeftIconUrl} />
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
          <Icon className="size-[22px]" src={chevronRightIconUrl} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-cutout-hole text-cutout-muted">
          <Icon className="size-[22px]" src={chevronRightIconUrl} />
        </span>
      )}
    </nav>
  );
}

function BlogPage() {
  const { pageInfo, posts } = Route.useLoaderData();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="border-cutout-hole border-b pb-8">
        <div className="grid gap-5">
          <div>
            <h1 className="font-display font-normal text-5xl leading-none sm:text-6xl">
              Blog
            </h1>
          </div>
        </div>
      </section>

      <ul className="grid gap-5">
        {posts.map((post) => (
          <li key={post.slug}>
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
                <h2 className="font-semibold text-2xl leading-snug">
                  {post.title}
                </h2>
                <div className="mt-2 text-cutout-muted text-sm">
                  {formatPostDate(post.publishedAt)}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <BlogPagination
        currentPage={pageInfo.currentPage}
        totalPages={pageInfo.totalPages}
      />
    </main>
  );
}
