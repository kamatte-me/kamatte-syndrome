import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import React from 'react';
import { Grid } from 'theme-ui';

import { SEO } from '@/components/elements/SEO';
import { CultureItem } from '@/components/pages/culture/CultureItem';
import { author } from '@/constants/site';
import { client } from '@/lib/microcms';
import { Culture } from '@/lib/microcms/model';

export const getStaticProps: GetStaticProps<{
  cultures: Culture[];
}> = async () => {
  const cultures = await client.getAllContents('culture', {
    limit: 50,
  });

  return {
    props: {
      cultures,
    },
  };
};

const CulturePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  cultures,
}) => {
  return (
    <>
      <SEO title="Culture" description={`${author}を構成するもの`} />
      <Grid as="dl" gap={3} columns={[2, 3, 4, 5]}>
        {cultures.map(item => (
          <CultureItem key={item.id} item={item} />
        ))}
      </Grid>
    </>
  );
};

export default CulturePage;
