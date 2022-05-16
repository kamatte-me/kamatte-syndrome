import 'destyle.css';

import React from 'react';
import { Container } from 'theme-ui';

import { Footer, FooterHeight } from '@/layout/Footer';
import { Header, HeaderHeight } from '@/layout/header';

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <Header />
      <div
        sx={{
          paddingTop: HeaderHeight,
          paddingBottom: FooterHeight,
        }}
      >
        <Container
          as="main"
          sx={{
            pt: [3, 4],
            pb: 5,
            px: 3,
          }}
        >
          {children}
        </Container>
      </div>
      <Footer />
    </>
  );
};
