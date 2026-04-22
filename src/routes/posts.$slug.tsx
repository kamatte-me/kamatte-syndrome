import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPosts } from 'content-collections';
import { formatPostDate } from '@/utils/posts';

const getPostBySlugServerFn = createServerFn({ method: 'GET' })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = allPosts.find((post) => post.slug === slug);
    if (!post) {
      throw notFound();
    }

    const MDXContent = post.mdx;

    return {
      ...post,
      mdx: await renderServerComponent(<MDXContent />),
    };
  });

export const Route = createFileRoute('/posts/$slug')({
  loader: ({ params: { slug } }) => getPostBySlugServerFn({ data: slug }),
  component: PostDetailPage,
  pendingComponent: () => <div>Loading...</div>,
});

function PostDetailPage() {
  const post = Route.useLoaderData();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="flex items-center gap-3 text-sm text-white/60">
        <Link
          to="/posts"
          className="rounded-full border border-white/20 px-4 py-1.5 transition hover:border-white/40 hover:text-white"
        >
          Back to Posts
        </Link>
        <span>{formatPostDate(post.publishedAt)}</span>
      </div>

      <article className="rounded-3xl border border-white/12 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <header className="mb-8 border-white/10 border-b pb-6">
          <p className="mb-3 font-semibold text-white/45 text-xs uppercase tracking-[0.3em]">
            {post.slug}
          </p>
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/60">
            <span>Published: {formatPostDate(post.publishedAt)}</span>
            {post.revisedAt ? (
              <span>Updated: {formatPostDate(post.revisedAt)}</span>
            ) : null}
          </div>
        </header>

        <div className="prose prose-invert max-w-none prose-a:text-cyan-300 prose-code:text-cyan-200 prose-headings:text-white prose-p:text-white/82">
          {post.mdx}
        </div>
      </article>
    </main>
  );
}
