import { Themed } from '@theme-ui/mdx';
import type { NextPage } from 'next';
import { BreadcrumbJsonLd, NextSeo } from 'next-seo';
import React from 'react';
import { Container, Heading } from 'theme-ui';

import { baseUrl, siteName } from '@/constants/site';

const PAGE_TITLE = '免責事項';

const TermsPage: NextPage = () => {
  return (
    <>
      <NextSeo
        description={`${siteName}の免責事項`}
        openGraph={{
          title: PAGE_TITLE,
        }}
        title={PAGE_TITLE}
      />
      <BreadcrumbJsonLd
        itemListElements={[
          {
            position: 1,
            name: PAGE_TITLE,
            item: `${baseUrl}/terms`,
          },
        ]}
      />

      <Container variant="narrowContainer">
        <Heading as="h1" sx={{ fontSize: 5, mb: 4 }}>
          免責事項
        </Heading>
        <Themed.ol>
          <Themed.li>
            当サイトに掲載された内容によって生じた損害等の一切の責任を負いません。
          </Themed.li>
          <Themed.li>
            すべての発言は個人のジョークであり、所属組織を代表するものではありません。
          </Themed.li>
        </Themed.ol>
      </Container>
    </>
  );
};

export default TermsPage;
