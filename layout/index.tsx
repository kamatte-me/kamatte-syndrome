/** @jsxRuntime classic */
/** @jsx jsx */
import 'destyle.css';

import { Global } from '@emotion/react';
import React from 'react';
import { Container, jsx } from 'theme-ui';

import { Footer, FooterHeight } from '@/layout/Footer';
import { GlobalHead } from '@/layout/GlobalHead';
import { Header, HeaderHeight } from '@/layout/header';

export const Layout: React.FC = ({ children }) => {
  return (
    <>
      <GlobalHead />
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
