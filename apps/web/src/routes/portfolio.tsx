import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPortfolios } from 'content-collections';
import type { ReactElement } from 'react';
import externalLinkIcon from '@/assets/icons/external_link_line.svg';
import { PageMain } from '@/components/layouts/PageMain';
import { PageTitle } from '@/components/layouts/PageTitle';
import { Icon } from '@/components/ui/Icon';
import { MarkdownContent } from '@/components/ui/MarkdownContent';

type RenderedServerComponent = RenderableServerComponent<ReactElement>;

type PortfolioListItem = {
  body: RenderedServerComponent;
  category: string;
  image?: string;
  link?: string;
  name: string;
  order: number;
  slug: string;
  technologies: string[];
  year: number;
};

type PortfolioYearGroup = {
  items: PortfolioListItem[];
  year: number;
};

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
        title: 'Portfolio | kamatte syndrome',
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

      <div className="grid gap-10">
        {portfolioGroups.map((group) => (
          <section
            key={group.year}
            className="grid gap-5 md:grid-cols-[112px_1fr]"
          >
            <h2 className="sticky top-6 h-fit font-display font-normal text-4xl text-cutout-hole sm:text-5xl">
              {group.year}
            </h2>

            <ul className="grid gap-5">
              {group.items.map((item) => (
                <PortfolioItemCard item={item} key={item.slug} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageMain>
  );
}

function PortfolioItemCard({ item }: { item: PortfolioListItem }) {
  const link = item.link || undefined;

  return (
    <li className="overflow-hidden border border-cutout-hole">
      <div className="grid items-start gap-5 p-4 sm:p-5 md:grid-cols-[minmax(9rem,11rem)_1fr] md:gap-6">
        <PortfolioImage item={item} link={link} />

        <div className="flex flex-col gap-5 md:min-h-44 md:py-1">
          <header className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cutout-hole px-3 py-1 font-semibold text-cutout-hole text-xs">
                {item.category}
              </span>
            </div>

            <h3 className="font-bold text-2xl leading-tight">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-cutout-hole hover:text-cutout-hole"
                >
                  {item.name}
                  <Icon className="size-4" src={externalLinkIcon} />
                </a>
              ) : (
                item.name
              )}
            </h3>
          </header>

          <MarkdownContent variant="compact">{item.body}</MarkdownContent>

          <ul className="mt-auto flex flex-wrap gap-2">
            {item.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-cutout-hole px-3 py-1 text-cutout-hole text-xs"
              >
                {technology}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

function PortfolioImage({
  item,
  link,
}: {
  item: PortfolioListItem;
  link?: string;
}) {
  const image = item.image || undefined;
  const frameClassName =
    'block aspect-square w-40 max-w-full justify-self-center overflow-hidden sm:w-44 md:w-full md:justify-self-start';
  const imageContent = image ? (
    <img
      src={image}
      alt={item.name}
      width={440}
      height={440}
      loading="lazy"
      className="h-full w-full object-contain"
    />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-cutout-hole p-6 text-center">
      <span className="text-black text-xs">大人の事情で</span>
      <span className="whitespace-nowrap font-display font-normal text-2xl text-black leading-none sm:text-3xl">
        No Image
      </span>
    </div>
  );

  if (!link) {
    return <div className={frameClassName}>{imageContent}</div>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className={`${frameClassName} hover:opacity-80`}
      aria-label={`${item.name} を開く`}
    >
      {imageContent}
    </a>
  );
}

function groupPortfolioItemsByYear(items: PortfolioListItem[]) {
  const groups = new Map<number, PortfolioListItem[]>();

  for (const item of items) {
    const group = groups.get(item.year);

    if (group) {
      group.push(item);
    } else {
      groups.set(item.year, [item]);
    }
  }

  return Array.from(groups, ([year, groupedItems]): PortfolioYearGroup => {
    return {
      year,
      items: groupedItems,
    };
  });
}
