import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { biography, skills as skillSet } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { author } from '@/constants/site';
import { BiographyProfile } from '@/features/biography/components/BiographyProfile';
import { BiographySkills } from '@/features/biography/components/BiographySkills';
import { createProfilePageStructuredData } from '@/features/biography/utils/jsonLd';
import { createJsonLdScript } from '@/utils/jsonLd';
import {
  createCanonicalLink,
  createPageMeta,
  formatPageTitle,
} from '@/utils/pageMeta';

const getBiographyPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    return {
      history: biography.history,
      revisedAt:
        biography.revisedAt > skillSet.revisedAt
          ? biography.revisedAt
          : skillSet.revisedAt,
      skills: skillSet.skills,
    };
  },
);

export const Route = createFileRoute('/biography')({
  loader: async () => getBiographyPageData(),
  head: ({ loaderData }) => ({
    links: [createCanonicalLink('/biography')],
    meta: createPageMeta({
      title: formatPageTitle('Biography'),
      openGraphTitle: 'Biography',
      description: `${author}のすべて`,
      path: '/biography',
    }),
    scripts: [
      createJsonLdScript(
        createProfilePageStructuredData({
          dateModified: loaderData?.revisedAt,
        }),
      ),
    ],
  }),
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
