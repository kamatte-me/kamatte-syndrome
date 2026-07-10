import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { biography, skills as skillSet } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { formatPageTitle } from '@/constants/site';
import { BiographyProfile } from '@/features/biography/components/BiographyProfile';
import { BiographySkills } from '@/features/biography/components/BiographySkills';

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
  head: () => ({ meta: [{ title: formatPageTitle('Biography') }] }),
  component: BiographyPage,
});

function BiographyPage() {
  const { history, skills } = Route.useLoaderData();

  return (
    <PageMain>
      <PageTitle>Biography</PageTitle>

      <BiographyProfile history={history} />
      <BiographySkills className="mt-12 md:mt-16" skills={skills} />
    </PageMain>
  );
}
