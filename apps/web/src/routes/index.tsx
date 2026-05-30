import { createFileRoute } from '@tanstack/react-router';
import { author, siteName, slogan } from '@/constants/site';
import { cn } from '@/utils/classNames';
import styles from './index.module.css';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-6 py-14 text-center">
      <h1 aria-label={siteName} className="flex w-full justify-center">
        <span
          aria-hidden="true"
          className={cn(
            styles.logoMask,
            'block h-40 w-full max-w-80 bg-cutout-hole sm:h-60 sm:max-w-[30rem]',
          )}
        />
      </h1>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <img
          src="/avatar.svg"
          alt={author}
          width={180}
          height={180}
          className="size-32 sm:size-40"
        />

        <p className="max-w-full whitespace-nowrap font-display font-normal text-[1.65rem] leading-none sm:text-5xl sm:leading-tight">
          {slogan}
        </p>
      </div>
    </main>
  );
}
