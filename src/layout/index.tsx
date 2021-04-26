/* @jsx jsx */
import '@fontsource/caveat/500.css';
import '@fontsource/josefin-sans/500.css';

import React from 'react';
import { Container, jsx } from 'theme-ui';

import Footer, { FooterHeight } from '@/layout/footer';
import Head from '@/layout/head';
import Header, { HeaderHeight } from '@/layout/header';

const Layout: React.FC = ({ children }) => {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default Layout;
