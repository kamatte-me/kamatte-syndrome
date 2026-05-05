import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { allBiographies, allSkills } from 'content-collections';
import githubIconUrl from '@/assets/icons/github.svg';

const getBiographyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    const biography = allBiographies[0];
    const skillSet = allSkills[0];

    if (!biography || !skillSet) {
      throw notFound();
    }

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
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="grid gap-8 border-white border-b pb-8 md:grid-cols-[240px_1fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <img
            src="/avatar.svg"
            alt="kamatte"
            width={240}
            height={240}
            className="aspect-square w-44 rounded-full border border-white bg-black p-3 sm:w-56"
          />
        </div>

        <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
          <div>
            <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
              Biography
            </p>
            <h1
              className="font-bold text-5xl leading-none sm:text-6xl"
              style={{
                fontFamily: 'var(--font-latin-dot-gothic)',
              }}
            >
              kamatte
            </h1>
          </div>

          <a
            href="https://github.com/kamatte-me"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white px-4 py-2 font-semibold text-sm text-white leading-none"
          >
            <img
              src={githubIconUrl}
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

      <section className="border border-white p-6 sm:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-white border-b pb-4">
          <h2 className="font-bold text-3xl">Biography</h2>
          <span className="font-semibold text-white/45 text-xs uppercase tracking-[0.28em]">
            History
          </span>
        </div>

        <dl className="grid gap-4">
          {history.map((item) => (
            <div
              key={`${item.year}-${item.description}`}
              className="grid gap-2 border border-white p-4 sm:grid-cols-[96px_1fr] sm:items-baseline"
            >
              <dt className="font-bold text-white text-xl">{item.year}</dt>
              <dd
                className="text-base text-white/78 leading-7"
                data-cutout-readable
              >
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border border-white p-6 sm:p-8">
        <div className="mb-6 flex items-baseline justify-between gap-4 border-white border-b pb-4">
          <h2 className="font-bold text-3xl">Skills</h2>
          <span className="font-semibold text-white/45 text-xs uppercase tracking-[0.28em]">
            Level
          </span>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <li key={skill.name} className="border border-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-lg">{skill.name}</h3>
                <span className="font-bold text-sm text-white/80">
                  {skill.level}
                </span>
              </div>
              <div
                aria-label={`${skill.name} skill level`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={skill.level}
                className="h-2.5 overflow-hidden rounded-full bg-white/15"
                data-cutout-progress-track
                role="progressbar"
              >
                <div
                  className="h-full rounded-full bg-white"
                  data-cutout-progress-value
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
