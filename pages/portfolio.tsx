/** @jsxRuntime classic */
/** @jsx jsx * */
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Box, jsx, Themed } from 'theme-ui';

import { PortfolioItem as PortfolioItemComponent } from '@/components/pages/portfolio/PortfolioItem';
import { getAllContents } from '@/lib/microcms';
import { Portfolio } from '@/lib/microcms/model';

export interface PortfolioItem
  extends Omit<Portfolio, 'year' | 'featuredImage' | 'technologies'> {
  featuredImageUrl?: string | null;
  technologies: string[];
}

type PortfolioDict = {
  [year: number]: PortfolioItem[];
};

export const getStaticProps = async () => {
  const portfolio = await getAllContents<Portfolio>('portfolio', {
    limit: 50,
  });
  const portfolioDict = portfolio.reduce<PortfolioDict>(
    (accumulator, current) => {
      const tmpAcc = accumulator;

      const key: number = current.year;
      const item: PortfolioItem = {
        id: current.id,
        title: current.title,
        url: current.url || null,
        featuredImageUrl: current.featuredImage
          ? current.featuredImage.url!
          : null,
        category: current.category,
        description: current.description,
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

type PortfolioPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const PortfolioPage: React.FC<PortfolioPageProps> = ({ portfolio }) => {
  return (
    <>
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
            <Themed.h1 sx={{ fontSize: 5, mb: 4, textAlign: 'center' }}>
              {year}
            </Themed.h1>
            {portfolio[Number(year)].map(item => (
              <Box
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
