import { Global as GlobalStyle } from '@emotion/react';
import { AppType } from 'next/dist/shared/lib/utils';
import Script from 'next/script';
import { DefaultSeo } from 'next-seo';
import React from 'react';
import { Themed, ThemeProvider } from 'theme-ui';

import { baseUrl, siteName, slogan } from '@/constants/site';
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

        {/* Google Analytics */}
        <Script id="google-analytics-dataLayer" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID}');
        `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID}`}
          strategy="afterInteractive"
        />

        {/* Unregister ServiceWorker */}
        <Script id="unregister-service-worker" strategy="afterInteractive">
          {`
          if (navigator.serviceWorker) {
            navigator.serviceWorker
              .getRegistrations()
              .then(function (registrations) {
                registrations.forEach(registration => {
                  registration.unregister();
                });
              })
              .catch(() => {});
          }
        `}
        </Script>

        <DefaultSeo
          titleTemplate={`%s - ${siteName}`}
          defaultTitle={siteName}
          description={slogan}
          additionalMetaTags={[
            {
              name: 'theme-color',
              content: theme.colors!.primary as string,
            },
          ]}
          additionalLinkTags={[
            {
              rel: 'shortcut icon',
              href: '/favicon.ico',
            },
            {
              rel: 'apple-touch-icon',
              href: '/apple-touch-icon.png',
            },
            {
              rel: 'manifest',
              href: '/manifest.json',
            },
            {
              rel: 'alternate',
              type: 'application/atom+xml',
              href: '/feed.xml',
              // @ts-ignore
              title: siteName,
            },
          ]}
          twitter={{
            cardType: 'summary',
            site: '@kamatte_me',
          }}
          facebook={{
            appId: '159097111464111',
          }}
          openGraph={{
            type: 'website',
            site_name: siteName,
            locale: 'ja_JP',
            images: [
              {
                url: `${baseUrl}/icon.png`,
              },
            ],
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
