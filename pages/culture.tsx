import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { Item } from '@/components/pages/culture/Item';
import { getAllContents } from '@/lib/microcms';
import { Culture } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  cultures: Culture[];
}> = async () => {
  const cultures = await getAllContents<Culture>('culture', {
    limit: 50,
  });

  return {
    props: {
      cultures,
    },
  };
};

const CulturePage: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  cultures,
}) => {
  return (
    <Grid as="dl" gap={3} columns={[2, 3, 4, 5]}>
      {cultures.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </Grid>
  );
};

export default CulturePage;
