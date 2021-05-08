/** @jsxRuntime classic */
/** @jsx jsx */
import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import { Flex, jsx } from 'theme-ui';

import { MainVisual } from '@/components/pages/index/MainVisual';
import { FooterHeight } from '@/layout/Footer';
import { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight + 100;

const IndexPage: NextPage = () => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: `calc(100vh - ${negativeHeight}px)`,
      }}
    >
      <Link href="/biography">
        <a>
          <MainVisual />
        </a>
      </Link>
    </Flex>
  );
};

export default IndexPage;
