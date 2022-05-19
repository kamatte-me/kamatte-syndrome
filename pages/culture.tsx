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

const PAGE_TITLE = 'Culture';

const CulturePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  cultures,
}) => {
  return (
    <>
      <NextSeo
        title={PAGE_TITLE}
        description={`${author}を構成するもの`}
        openGraph={{
          title: PAGE_TITLE,
        }}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: PAGE_TITLE,
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
