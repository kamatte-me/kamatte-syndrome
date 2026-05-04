import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-6 py-14 text-center">
      <h1
        className="font-bold text-5xl leading-tight sm:text-7xl"
        style={{
          fontFamily: 'var(--font-latin-dot-gothic)',
        }}
      >
        かまって☆しんどろ〜む
      </h1>

      <img
        src="/avatar.svg"
        alt="kamatte"
        width={180}
        height={180}
        className="size-40 sm:size-48"
      />

      <p
        className="font-bold text-4xl leading-tight sm:text-6xl"
        style={{
          fontFamily: 'var(--font-latin-dot-gothic)',
        }}
      >
        plz kamatte me!!!
      </p>
    </main>
  );
}
