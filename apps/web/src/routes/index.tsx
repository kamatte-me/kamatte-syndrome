import { createFileRoute } from '@tanstack/react-router';
import { cn } from '@/utils/classNames';
import styles from './index.module.css';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-6 py-14 text-center">
      <h1
        aria-label="かまって☆しんどろ〜む"
        className="flex w-full justify-center"
      >
        <span
          aria-hidden="true"
          className={cn(
            styles.logoMask,
            'block h-48 w-full max-w-96 bg-cutout-hole sm:h-72 sm:max-w-[34rem]',
          )}
        />
      </h1>

      <img
        src="/avatar.svg"
        alt="kamatte"
        width={180}
        height={180}
        className="size-40 sm:size-48"
      />

      <p className="font-display font-normal text-4xl leading-tight sm:text-6xl">
        plz kamatte me!!!
      </p>
    </main>
  );
}
