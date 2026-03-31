import Image from 'next/image';

export default function Home() {
  return (
    <main className="relative row-start-2 flex flex-col items-center justify-center gap-8 p-10">
      <Image
        className="scale-150"
        src="/avatar.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />

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

      <a href="/">Enter</a>
      <a href="https://kids.yahoo.co.jp/">Exit</a>
    </main>
  );
}
