import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import React from 'react';
import { Box, Heading } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { PortfolioItem as PortfolioItemComponent } from '@/components/pages/portfolio/PortfolioItem';
import { author } from '@/constants/site';
import { client } from '@/lib/microcms';
import { Portfolio } from '@/lib/microcms/model';

export interface PortfolioItem
  extends Omit<Portfolio, 'year' | 'technologies'> {
  technologies: string[];
}

type PortfolioDict = {
  [year: number]: PortfolioItem[];
};

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
      (tmpAcc[key] || (tmpAcc[key] = [])).push(item);
      return tmpAcc;
    },
    {} as PortfolioDict,
  );

  return {
    props: {
      portfolio: portfolioDict,
    },
  };
};

const PortfolioPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> =
  ({ portfolio }) => {
    return (
      <>
        <SEO
          title="Portfolio"
          description={`${author}の戦歴に刮目せよ！！ ババァ〜〜〜ン`}
        />
        {Object.keys(portfolio)
          .reverse()
          .map(year => (
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
              {portfolio[Number(year)].map(item => (
                <Box
                  key={item.id}
                  as="ul"
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
