import type { Biography } from 'content-collections';
import githubIcon from '@/assets/github_white.svg';
import { author } from '@/constants/site';
import { HistoryList } from './HistoryList';

type BiographyProfileProps = {
  history: Biography['history'];
};

export function BiographyProfile({ history }: BiographyProfileProps) {
  return (
    <section className="mx-auto grid max-w-full md:w-fit md:grid-cols-[256px_minmax(0,max-content)] md:items-start md:gap-8 lg:grid-cols-[288px_minmax(0,max-content)] lg:gap-12">
      <div className="flex justify-center md:justify-start">
        <img
          src="/avatar.svg"
          alt={author}
          width={288}
          height={288}
          className="aspect-square w-56 sm:w-64 lg:w-72"
        />
      </div>

      <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
        <div>
          <h2 className="font-display font-normal text-5xl leading-none sm:text-6xl">
            {author}
          </h2>
        </div>

        <a
          href="https://github.com/kamatte-me"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cutout-hole px-4 py-2 font-bold text-base text-cutout-hole leading-none"
        >
          <img
            src={githubIcon}
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            className="block size-5 shrink-0"
          />
          GitHub
        </a>

        <HistoryList history={history} />
      </div>
    </section>
  );
}
