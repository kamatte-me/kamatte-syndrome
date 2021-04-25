/* @jsx jsx */
import React from 'react';
import { Container, jsx, Themed } from 'theme-ui';

import Footer, { FooterHeight } from '@/layout/footer';
import Head from '@/layout/head';
import Header, { HeaderHeight } from '@/layout/header';

const negativeHeight = HeaderHeight + FooterHeight;

const Layout: React.FC = ({ children }) => {
  return (
    <Themed.root>
      <Head />
      <Header />
      <Container
        as="main"
        sx={{
          paddingTop: HeaderHeight,
          paddingBottom: FooterHeight,
          px: 3,
        }}
      >
        {children}
      </Container>
      <Footer />
    </Themed.root>
  );
};

export default Layout;
