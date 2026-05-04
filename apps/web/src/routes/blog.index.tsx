import {
  createFileRoute,
  Link,
  notFound,
  redirect,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { allPosts } from 'content-collections';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
          className="inline-flex size-11 items-center justify-center rounded-full border border-white bg-black/30 text-white/75 hover:bg-black/45 hover:text-white"
        >
          <ChevronLeft aria-hidden="true" size={22} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-white bg-black/15 text-white/25">
          <ChevronLeft aria-hidden="true" size={22} />
        </span>
      )}

      <p className="min-w-20 text-center font-semibold text-white/72">
        <span className="text-2xl text-white">{currentPage}</span>
        <span className="ml-1 text-sm text-white/45">/ {totalPages}</span>
      </p>

      {hasNext ? (
        <Link
          to="/blog"
          search={getBlogPageSearch(currentPage + 1)}
          activeOptions={paginationLinkActiveOptions}
          aria-label="次のページ"
          className="inline-flex size-11 items-center justify-center rounded-full border border-white bg-black/30 text-white/75 hover:bg-black/45 hover:text-white"
        >
          <ChevronRight aria-hidden="true" size={22} />
        </Link>
      ) : (
        <span className="inline-flex size-11 items-center justify-center rounded-full border border-white bg-black/15 text-white/25">
          <ChevronRight aria-hidden="true" size={22} />
        </span>
      )}
    </nav>
  );
}

function BlogPage() {
  const { pageInfo, posts } = Route.useLoaderData();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="border-white border-b pb-8">
        <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
          Blog
        </p>
        <h1 className="mb-4 font-bold text-4xl sm:text-5xl">記事一覧</h1>
        <p className="max-w-3xl text-base text-white/78 leading-8">
          `content-collections/mdx` で収集した記事を、RSC
          経由で公開日順に描画しています。 URL は既存ファイル名ベースの `slug`
          をそのまま使います。
        </p>
        <p className="mt-5 text-sm text-white/50">
          {pageInfo.totalItems} entries / page {pageInfo.currentPage}
        </p>
      </section>

      <ul className="grid gap-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="flex gap-4 border border-white p-5 sm:gap-6 sm:p-6"
            >
              <div className="size-20 shrink-0 overflow-hidden border border-white bg-black sm:size-[120px]">
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
                <div className="mt-2 text-sm text-white/55">
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
