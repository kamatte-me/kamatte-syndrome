import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { biography, skills as skillSet } from 'content-collections';
import githubIcon from '@/assets/github_white.svg';
import PageMain from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';

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

      <section className="grid gap-8 border-cutout-hole border-b pb-8 md:grid-cols-[240px_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <img
            src="/avatar.svg"
            alt="kamatte"
            width={240}
            height={240}
            className="aspect-square w-44 rounded-full border border-cutout-hole p-3 sm:w-56"
          />
        </div>

        <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
          <div>
            <h2 className="font-display font-normal text-6xl leading-none sm:text-7xl">
              kamatte
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
        </div>
      </section>

      <section className="border border-cutout-hole p-6 sm:p-8">
        <div className="mb-6 border-cutout-hole border-b pb-4">
          <h2 className="font-display font-normal text-3xl">Biography</h2>
        </div>

        <dl className="grid gap-4">
          {history.map((item) => (
            <div
              key={`${item.year}-${item.description}`}
              className="grid gap-2 border border-cutout-hole p-4 sm:grid-cols-[96px_1fr] sm:items-baseline"
            >
              <dt className="font-bold text-cutout-hole text-xl">
                {item.year}
              </dt>
              <dd className="text-base text-cutout-readable leading-7">
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
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
