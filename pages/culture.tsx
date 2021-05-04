import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { Seo } from '@/components/elements/Seo';
import { CultureItem } from '@/components/pages/culture/CultureItem';
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
    <>
      <Seo title="Culture" description="kamatteを構成するもの" />
      <Grid as="dl" gap={3} columns={[2, 3, 4, 5]}>
        {cultures.map(item => (
          <CultureItem key={item.id} item={item} />
        ))}
      </Grid>
    </>
  );
};

export default CulturePage;
