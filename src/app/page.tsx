'use client';
import Image from 'next/image';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <main className="relative row-start-2 flex flex-col items-center justify-center gap-8 p-10">
      <Image
        src="/avatar.svg"
        alt="kamatte"
        width={180}
        height={180}
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
      <Link href="/biography">Enter</Link>
      <a href="https://kids.yahoo.co.jp/">Exit</a>
    </main>
  );
};

export default Home;
