import type { NextPage } from 'next';
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
        logo={`${baseUrl}/icon.png`}
        name={siteName}
        url={baseUrl}
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
