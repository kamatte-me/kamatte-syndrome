/** @jsxRuntime classic */
/** @jsx jsx */
import Link from 'next/link';
import React from 'react';
import { Flex, jsx } from 'theme-ui';

import { MainVisual } from '@/components/index/MainVisual';
import { FooterHeight } from '@/layout/footer';
import { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight + 80;

const IndexPage: React.FC = () => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: `calc(100vh - ${negativeHeight}px)`,
      }}
    >
      <Link href="/bio">
        <a>
          <MainVisual />
        </a>
      </Link>
    </Flex>
  );
};

export default IndexPage;
