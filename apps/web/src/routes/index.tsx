import { createFileRoute } from '@tanstack/react-router';
import { author, siteName, slogan } from '@/constants/site';
import { cn } from '@/utils/classNames';
import styles from './index.module.css';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 aria-label={siteName} className="flex w-full justify-center">
        <span
          aria-hidden="true"
          className={cn(
            styles.logoMask,
            'block h-40 w-full max-w-80 bg-cutout-hole sm:h-48 sm:max-w-[24rem] md:h-56 md:max-w-[28rem] lg:h-60 lg:max-w-[30rem]',
          )}
        />
      </h1>

      <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:items-start md:gap-4">
        <img
          src="/avatar.svg"
          alt={author}
          width={180}
          height={180}
          className="order-2 size-32 md:order-1 md:mt-14 md:size-36 lg:mt-16 lg:size-40"
        />

        <div
          className={cn(
            styles.speechBubble,
            'relative order-1 max-w-full px-6 pt-4 pb-5 text-cutout-hole sm:px-7 sm:pt-5 sm:pb-6 md:order-2 md:-translate-y-5 md:px-8 md:pt-7 md:pb-7 lg:-translate-y-6 lg:px-9 lg:pt-8 lg:pb-8',
          )}
        >
          <span aria-hidden="true" className={styles.speechBubbleShape} />
          <p
            className={cn(
              styles.speechBubbleText,
              'whitespace-nowrap font-display font-normal text-[1.65rem] leading-none sm:text-[2.1rem] md:text-[2.5rem] md:leading-tight lg:text-5xl',
            )}
          >
            {slogan}
          </p>
        </div>
      </div>
    </main>
  );
}
