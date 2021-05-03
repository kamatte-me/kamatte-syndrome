import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { IllustrationCard } from '@/components/illustration/IllustrationCard';
import { getAllContents } from '@/lib/microcms';
import { Illustration } from '@/lib/microcms/model';

export const getStaticProps = async () => {
  const illustrations = await getAllContents<Illustration>('illustration', {
    orders: 'publishedAt',
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
      <Grid gap={4} columns={[1, 2]}>
        {illustrations.map(item => (
          <IllustrationCard key={item.id} illustration={item} />
        ))}
      </Grid>
    </>
  );
};

export default IllustrationPage;
