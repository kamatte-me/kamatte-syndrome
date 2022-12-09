import { NextPage } from 'next';
import Link from 'next/link';
import { OrganizationJsonLd } from 'next-seo';
import React from 'react';
import { Flex } from 'theme-ui';

import { FitScreenContainer } from '@/components/elements/FitScreenContainer';
import { MainVisual } from '@/components/pages/index/MainVisual';
import { baseUrl, siteName } from '@/constants/site';

const IndexPage: NextPage = () => {
  return (
    <>
      <OrganizationJsonLd
        name={siteName}
        url={baseUrl}
        logo={`${baseUrl}/icon.png`}
      />

      <FitScreenContainer>
        <Flex
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Link href="/biography">
            <MainVisual />
          </Link>
        </Flex>
      </FitScreenContainer>
    </>
  );
};

export default IndexPage;
