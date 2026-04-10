import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="relative row-start-2 flex flex-col items-center justify-center gap-8 p-10">
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
      <Link to="/about">Enter</Link>
      <a href="https://kids.yahoo.co.jp/">Exit</a>
    </main>
  );
}
