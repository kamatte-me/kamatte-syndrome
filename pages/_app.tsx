import { Global as GlobalStyle } from '@emotion/react';
import { Themed } from '@theme-ui/mdx';
import type { AppType } from 'next/dist/shared/lib/utils';
import Head from 'next/head';
import Script from 'next/script';
import { DefaultSeo } from 'next-seo';
import { ThemeUIProvider } from 'theme-ui';

import { baseUrl, siteName, slogan } from '@/constants/site';
import { Layout } from '@/layout';
import { theme } from '@/theme';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeUIProvider theme={theme}>
      <Themed.root>
        <GlobalStyle
          styles={{
            body: {
              wordBreak: 'break-all',
              WebkitFontSmoothing: 'antialiased',
            },
            '.iframely-embed': {
              margin: '1.6em 0',
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
          defaultTitle={siteName}
          description={slogan}
          titleTemplate={`%s - ${siteName}`}
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
              // @ts-expect-error -- ライブラリ側未定義
              title: siteName,
            },
          ]}
          additionalMetaTags={[
            {
              name: 'theme-color',
              content: theme.colors?.primary as string,
            },
          ]}
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
          twitter={{
            cardType: 'summary',
            site: '@kamatte_me',
          }}
        />
        <Head>
          <meta content="light" name="color-scheme" />
        </Head>

        <Layout>
          {}
          <Component {...pageProps} />
        </Layout>
      </Themed.root>
    </ThemeUIProvider>
  );
};

export default MyApp;
