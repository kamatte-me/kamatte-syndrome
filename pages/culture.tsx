import { GetStaticProps, InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { CultureItem } from '@/components/pages/culture/CultureItem';
import { fetchAllContents } from '@/lib/microcms';
import { Culture } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  cultures: Culture[];
}> = async () => {
  const cultures = await fetchAllContents<Culture>('culture', {
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
      <SEO title="Culture" description="kamatteを構成するもの" />
      <Grid as="dl" gap={3} columns={[2, 3, 4, 5]}>
        {cultures.map(item => (
          <CultureItem key={item.id} item={item} />
        ))}
      </Grid>
    </>
  );
};

export default CulturePage;
