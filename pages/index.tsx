import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';
import { Flex } from 'theme-ui';

import { FitScreenContainer } from '@/components/elements/FitScreenContainer';
import { MainVisual } from '@/components/pages/index/MainVisual';

const IndexPage: NextPage = () => {
  return (
    <FitScreenContainer>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Link href="/biography">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <MainVisual />
          </a>
        </Link>
      </Flex>
    </FitScreenContainer>
  );
};

export default IndexPage;
