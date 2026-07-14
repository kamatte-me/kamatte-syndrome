import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPortfolios } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { MarkdownContentImage } from '@/components/ui/MarkdownContentImage';
import { author } from '@/constants/site';
import { PortfolioYearGroups } from '@/features/portfolio/components/PortfolioYearGroups';
import { groupPortfolioItemsByYear } from '@/features/portfolio/utils/groupPortfolioItemsByYear';
import {
  createCanonicalLink,
  createPageMeta,
  formatPageTitle,
} from '@/utils/pageMeta';

const getPortfolioPageData = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (allPortfolios.length === 0) {
      throw notFound();
    }

    const portfolioItems = await Promise.all(
      [...allPortfolios]
        .sort((a, b) => b.order - a.order)
        .map(
          async ({
            content: _content,
            mdx: MDXContent,
            revisedAt: _revisedAt,
            ...item
          }) => ({
            ...item,
            body: await renderServerComponent(
              <MDXContent components={{ img: MarkdownContentImage }} />,
            ),
          }),
        ),
    );

    return groupPortfolioItemsByYear(portfolioItems);
  },
);

export const Route = createFileRoute('/portfolio')({
  loader: async () => getPortfolioPageData(),
  head: () => ({
    links: [createCanonicalLink('/portfolio')],
    meta: createPageMeta({
      title: formatPageTitle('Portfolio'),
      openGraphTitle: 'Portfolio',
      description: `${author}の戦歴に刮目せよ！！ ババァ〜〜〜ン`,
      path: '/portfolio',
    }),
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const portfolioGroups = Route.useLoaderData();

  return (
    <PageMain>
      <PageTitle>Portfolio</PageTitle>

      <PortfolioYearGroups groups={portfolioGroups} />
    </PageMain>
  );
}
