import { AppType } from 'next/dist/next-server/lib/utils';
import React from 'react';
import { Themed, ThemeProvider } from 'theme-ui';

import { Layout } from '@/layout';
import { theme } from '@/theme';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Themed.root>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} />
        </Layout>
      </Themed.root>
    </ThemeProvider>
  );
};

export default MyApp;
