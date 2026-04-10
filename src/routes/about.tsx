import { createFileRoute } from '@tanstack/react-router';
import { allPosts } from 'content-collections';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 font-bold text-4xl text-[var(--sea-ink)] sm:text-5xl">
          A small starter with room to grow.
        </h1>
        <p className="m-0 max-w-3xl text-[var(--sea-ink-soft)] text-base leading-8">
          TanStack Start gives you type-safe routing, server functions, and
          modern SSR defaults. Use this as a clean foundation, then layer in
          your own routes, styling, and add-ons.
        </p>
      </section>

      <ul>
        {allPosts.map((post) => (
          <li key={post._meta.path} className="mb-6">
            <a href={`/posts/${post._meta.path}`}>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
