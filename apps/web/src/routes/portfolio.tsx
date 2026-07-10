import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPortfolios } from 'content-collections';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { formatPageTitle } from '@/constants/site';
import { PortfolioYearGroups } from '@/features/portfolio/components/PortfolioYearGroups';
import { groupPortfolioItemsByYear } from '@/features/portfolio/utils/groupPortfolioItemsByYear';

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
            body: await renderServerComponent(<MDXContent />),
          }),
        ),
    );

    return groupPortfolioItemsByYear(portfolioItems);
  },
);

export const Route = createFileRoute('/portfolio')({
  loader: async () => getPortfolioPageData(),
  head: () => ({
    meta: [
      {
        title: formatPageTitle('Portfolio'),
      },
      {
        name: 'description',
        content: 'kamatte の制作物、仕事、発表、ハッカソンの記録。',
      },
    ],
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
