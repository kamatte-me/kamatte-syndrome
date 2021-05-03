/** @jsxRuntime classic */
/** @jsx jsx */
import 'destyle.css';

import { Global } from '@emotion/react';
import React from 'react';
import { Container, jsx } from 'theme-ui';

import { Footer, FooterHeight } from '@/layout/footer';
import { Head } from '@/layout/head';
import { Header, HeaderHeight } from '@/layout/header';

export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Head />
      <Global
        styles={() => ({
          html: {
            visibility: 'hidden',
          },
          'html.wf-active': {
            visibility: 'visible',
          },
        })}
      />
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
            py: [3, 4],
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
