import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPosts } from 'content-collections';
import { LinkCard } from '@/features/url-embeds/components/LinkCard';
import { OEmbed } from '@/features/url-embeds/components/OEmbed';
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
      mdx: await renderServerComponent(
        <MDXContent components={{ LinkCard, OEmbed }} />,
      ),
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
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="flex items-center gap-3 text-sm text-white/60">
        <Link
          to="/blog"
          className="rounded-full border border-white/20 px-4 py-1.5 transition hover:border-white/40 hover:text-white"
        >
          Back to Blog
        </Link>
      </div>

      <article className="rounded-3xl border border-white/12 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-9">
        <header className="mb-8 border-white/10 border-b pb-6">
          <h1 className="font-bold text-4xl leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-white/60">
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

        <div className="prose prose-invert max-w-none prose-a:text-cyan-300 prose-code:text-cyan-200 prose-headings:text-white prose-p:text-white/82">
          {post.mdx}
        </div>
      </article>
    </main>
  );
}
