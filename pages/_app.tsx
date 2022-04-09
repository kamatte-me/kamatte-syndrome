import { Global as GlobalStyle } from '@emotion/react';
import { AppType } from 'next/dist/shared/lib/utils';
import React from 'react';
import { Themed, ThemeProvider } from 'theme-ui';

import { Layout } from '@/layout';
import { theme } from '@/theme';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Themed.root>
        <GlobalStyle
          styles={{
            body: {
              wordBreak: 'break-all',
              WebkitFontSmoothing: 'antialiased',
            },
          }}
        />
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </Themed.root>
    </ThemeProvider>
  );
};

export default MyApp;
