import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { IllustrationItem } from '@/components/pages/illustration/IllustrationItem';
import { getAllContents } from '@/lib/microcms';
import { Illustration } from '@/lib/microcms/model';

export const getStaticProps = async () => {
  const illustrations = await getAllContents<Illustration>('illustration', {
    orders: 'publishedAt',
    limit: 100,
  });

  return {
    props: {
      illustrations,
    },
  };
};

type IllustrationPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const IllustrationPage: React.FC<IllustrationPageProps> = ({
  illustrations,
}) => {
  return (
    <>
      <Grid as="dl" gap={4} columns={[1, 2]}>
        {illustrations.map(item => (
          <IllustrationItem key={item.id} item={item} />
        ))}
      </Grid>
    </>
  );
};

export default IllustrationPage;
