import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import React from 'react';
import { Box, Heading } from 'theme-ui';

import { PortfolioItem as PortfolioItemComponent } from '@/components/pages/portfolio/PortfolioItem';
import { author, baseUrl } from '@/constants/site';
import { client } from '@/lib/microcms';
import type { Portfolio } from '@/lib/microcms/model';

export interface PortfolioItem
  extends Omit<Portfolio, 'year' | 'technologies'> {
  technologies: string[];
}

type PortfolioDict = Record<number, PortfolioItem[]>;

export const getStaticProps: GetStaticProps<{
  portfolio: PortfolioDict;
}> = async () => {
  const portfolio = await client.getAllContents('portfolio', {
    limit: 20,
  });
  const portfolioDict = portfolio.reduce<PortfolioDict>(
    (accumulator, current) => {
      const tmpAcc = accumulator;

      const key: number = current.year;
      const item: PortfolioItem = {
        ...current,
        technologies: current.technologies
          ? current.technologies.trim().split('\n')
          : [],
      };
      (tmpAcc[key] ?? (tmpAcc[key] = [])).push(item);
      return tmpAcc;
    },
    {},
  );

  return {
    props: {
      portfolio: portfolioDict,
    },
  };
};

const PAGE_TITLE = 'Portfolio';

const PortfolioPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ portfolio }) => {
  return (
    <>
      <NextSeo
        description={`${author}の戦歴に刮目せよ！！ ババァ〜〜〜ン`}
        openGraph={{
          title: PAGE_TITLE,
        }}
        title={PAGE_TITLE}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: PAGE_TITLE,
            item: `${baseUrl}/portfolio`,
          },
        ]}
      />

      {Object.keys(portfolio)
        .reverse()
        .map((year) => (
          <Box
            key={year}
            sx={{
              ':not(:last-child)': {
                mb: 5,
              },
            }}
          >
            <Heading
              as="h1"
              sx={{
                fontSize: 5,
                mb: 4,
                textAlign: 'center',
              }}
            >
              {year}
            </Heading>
            {portfolio[Number(year)]?.map((item) => (
              <Box
                as="ul"
                key={item.id}
                sx={{
                  ':not(:last-child)': {
                    mb: 5,
                  },
                }}
              >
                <PortfolioItemComponent item={item} />
              </Box>
            ))}
          </Box>
        ))}
    </>
  );
};

export default PortfolioPage;
