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
          <a>
            <MainVisual />
          </a>
        </Link>
      </Flex>
    </FitScreenContainer>
  );
};

export default IndexPage;
