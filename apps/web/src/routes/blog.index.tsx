import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { allPosts } from 'content-collections';
import { formatPostDate, sortPostsByPublishedAtDesc } from '@/utils/posts';

const getBlogIndex = createServerFn({ method: 'GET' }).handler(async () => {
  return sortPostsByPublishedAtDesc(allPosts).map(
    ({ mdx: _mdx, content: _content, ...post }) => post,
  );
});

export const Route = createFileRoute('/blog/')({
  loader: async () => getBlogIndex(),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
          Blog
        </p>
        <h1 className="mb-4 font-bold text-4xl sm:text-5xl">記事一覧</h1>
        <p className="max-w-3xl text-base text-white/78 leading-8">
          `content-collections/mdx` で収集した記事を、RSC
          経由で公開日順に描画しています。 URL は既存ファイル名ベースの `slug`
          をそのまま使います。
        </p>
      </section>

      <ul className="grid gap-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="block rounded-3xl border border-white/10 bg-black/25 p-6 transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/35"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
                <span>{formatPostDate(post.publishedAt)}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.2em]">
                  {post.slug}
                </span>
              </div>
              <h2 className="mb-3 font-semibold text-2xl">{post.title}</h2>
              <p className="line-clamp-3 text-white/72 leading-7">
                {post.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
