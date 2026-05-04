import { createFileRoute, notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import type { RenderableServerComponent } from '@tanstack/react-start/rsc';
import { renderServerComponent } from '@tanstack/react-start/rsc';
import { allPortfolios } from 'content-collections';
import { ExternalLink } from 'lucide-react';
import type { ReactElement } from 'react';
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
  technologies: Array<string>;
  year: number;
};

type PortfolioYearGroup = {
  items: Array<PortfolioListItem>;
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
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12">
      <section className="border-white border-b pb-8">
        <p className="mb-3 font-semibold text-white/55 text-xs uppercase tracking-[0.3em]">
          Portfolio
        </p>
        <div className="grid gap-5">
          <div>
            <h1
              className="font-bold text-5xl leading-none sm:text-6xl"
              style={{
                fontFamily: 'var(--font-latin-dot-gothic)',
              }}
            >
              ポートフォリオ
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/72 leading-8">
              つくったもの、関わったもの、なぜか賞をもらったもの。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-10">
        {portfolioGroups.map((group) => (
          <section
            key={group.year}
            className="grid gap-5 md:grid-cols-[112px_1fr]"
          >
            <h2 className="sticky top-6 h-fit font-bold text-4xl text-white sm:text-5xl">
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
    </main>
  );
}

function PortfolioItemCard({ item }: { item: PortfolioListItem }) {
  const link = item.link || undefined;

  return (
    <li className="overflow-hidden border border-white">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <PortfolioImage item={item} link={link} />

        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <header className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white px-3 py-1 font-semibold text-white/75 text-xs">
                {item.category}
              </span>
            </div>

            <h3 className="font-bold text-2xl leading-tight">
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white hover:text-white/72"
                >
                  {item.name}
                  <ExternalLink
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    strokeWidth={2}
                  />
                </a>
              ) : (
                item.name
              )}
            </h3>
          </header>

          <MarkdownContent variant="compact">{item.body}</MarkdownContent>

          <ul className="flex flex-wrap gap-2">
            {item.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-white px-3 py-1 text-white/70 text-xs"
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
  const imageContent = image ? (
    <img
      src={image}
      alt={item.name}
      width={440}
      height={280}
      loading="lazy"
      className="h-full min-h-48 w-full object-cover md:min-h-full"
    />
  ) : (
    <div className="flex h-full min-h-48 w-full items-center justify-center border-white border-b p-6 text-center md:min-h-full md:border-r md:border-b-0">
      <span
        className="font-bold text-2xl text-white/30"
        style={{
          fontFamily: 'var(--font-latin-dot-gothic)',
        }}
      >
        No Image
      </span>
    </div>
  );

  if (!link) {
    return (
      <div className="border-white border-b md:border-r md:border-b-0">
        {imageContent}
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="block border-white border-b hover:opacity-80 md:border-r md:border-b-0"
      aria-label={`${item.name} を開く`}
    >
      {imageContent}
    </a>
  );
}

function groupPortfolioItemsByYear(items: Array<PortfolioListItem>) {
  const groups = new Map<number, Array<PortfolioListItem>>();

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
