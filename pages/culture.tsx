import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import React from 'react';
import { Grid } from 'theme-ui';

import { CultureItem } from '@/components/pages/culture/CultureItem';
import { author, baseUrl } from '@/constants/site';
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
      <NextSeo title="Culture" description={`${author}を構成するもの`} />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: 'Culture',
            item: `${baseUrl}/culture`,
          },
        ]}
      />

      <Grid as="dl" gap={3} columns={[2, 3, 4, 5]}>
        {cultures.map(item => (
          <CultureItem key={item.id} item={item} />
        ))}
      </Grid>
    </>
  );
};

export default CulturePage;
