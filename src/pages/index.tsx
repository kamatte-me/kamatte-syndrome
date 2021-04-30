/* @jsx jsx */
import { Link } from 'gatsby';
import React from 'react';
import { Flex, jsx } from 'theme-ui';

import { MainVisual } from '@/components/index/main-visual';
import { Layout } from '@/layout';
import { FooterHeight } from '@/layout/footer';
import { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight + 80;

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: `calc(100vh - ${negativeHeight}px)`,
        }}
      >
        <Link to="/bio" style={{ textDecoration: 'none' }}>
          <MainVisual />
        </Link>
      </Flex>
    </Layout>
  );
};

export default IndexPage;
