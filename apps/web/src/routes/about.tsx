import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-12">
      <section className="rounded-3xl border border-white/15 bg-white/8 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
          About
        </p>
        <h1 className="mb-4 font-bold text-4xl sm:text-5xl">
          かまって☆しんどろ〜む / TanStack Start edition
        </h1>
        <p className="max-w-3xl text-base text-white/78 leading-8">
          `content-collections/mdx` で記事をビルド時に集約しつつ、 TanStack
          Start のルーティングと Vercel の実行基盤へ乗せた構成です。
          コンテンツは既存の `kamatte-syndrome-content` をそのまま参照します。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
          <h2 className="mb-3 font-semibold text-xl">What changed</h2>
          <p className="text-sm text-white/70 leading-7">
            投稿一覧を `/posts`、個別記事を `/posts/$slug` に分離し、MDX は
            `content-collections` が型付きで生成します。
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
          <h2 className="mb-3 font-semibold text-xl">Runtime</h2>
          <p className="text-sm text-white/70 leading-7">
            Vite 側には Nitro を追加し、Vercel 向けのビルド出力を生成します。
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/posts"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2 font-semibold text-sm transition hover:bg-white/20"
        >
          Browse Posts
        </Link>
        <Link
          to="/"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/75 transition hover:border-white/40 hover:text-white"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}
