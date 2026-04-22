import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="relative row-start-2 flex min-h-screen flex-col items-center justify-center gap-8 p-10 text-center">
      <img src="/avatar.svg" alt="kamatte" width={180} height={180} />

      <h1
        className="text-center font-bold text-6xl sm:text-left"
        style={{
          fontFamily: 'var(--font-latin-dot-gothic)',
        }}
      >
        plz
        <br className="sm:hidden" /> kamatte
        <br className="sm:hidden" /> me!!!
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/posts"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2 font-semibold text-sm transition hover:bg-white/20"
        >
          Enter Posts
        </Link>
        <Link
          to="/about"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
        >
          About
        </Link>
        <a
          href="https://kids.yahoo.co.jp/"
          className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/60 transition hover:border-white/40 hover:text-white"
        >
          Exit
        </a>
      </div>
    </main>
  );
}
