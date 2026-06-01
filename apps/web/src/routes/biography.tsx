import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { biography, skills as skillSet } from 'content-collections';
import githubIcon from '@/assets/github_white.svg';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { author } from '@/constants/site';

const getBiographyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      history: biography.history,
      skills: skillSet.skills,
    };
  },
);

export const Route = createFileRoute('/biography')({
  loader: async () => getBiographyPageData(),
  component: BiographyPage,
});

function BiographyPage() {
  const { history, skills } = Route.useLoaderData();

  return (
    <PageMain>
      <PageTitle>Biography</PageTitle>

      <section className="grid border-cutout-hole border-b pb-8 md:grid-cols-[288px_1fr] md:items-start md:gap-6">
        <div className="flex justify-center md:justify-start">
          <img
            src="/avatar.svg"
            alt={author}
            width={288}
            height={288}
            className="aspect-square w-56 sm:w-72"
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
            className="inline-flex items-center gap-2 rounded-full border border-cutout-hole px-4 py-2 font-semibold text-cutout-hole text-sm leading-none"
          >
            <img
              src={githubIcon}
              alt=""
              aria-hidden="true"
              width={18}
              height={18}
              className="block size-[18px] shrink-0"
            />
            GitHub
          </a>

          <dl className="mx-auto grid w-fit max-w-full gap-0.5 text-left text-sm leading-6 sm:text-base md:mx-0 md:w-full md:max-w-md">
            {history.map((item) => (
              <div
                key={`${item.year}-${item.description}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-1 sm:gap-4"
              >
                <dt className="text-cutout-hole tabular-nums">{item.year}年</dt>
                <dd className="text-cutout-readable">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border border-cutout-hole p-6 sm:p-8">
        <div className="mb-6 border-cutout-hole border-b pb-4">
          <h2 className="font-display font-normal text-3xl">Skills</h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <li key={skill.name} className="border border-cutout-hole p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
                <span className="font-bold text-cutout-hole text-sm">
                  {skill.level}
                </span>
              </div>
              <div
                aria-label={`${skill.name} skill level`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={skill.level}
                className="h-2.5 overflow-hidden rounded-full bg-transparent"
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-cutout-hole"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageMain>
  );
}
