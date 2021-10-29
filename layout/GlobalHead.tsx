/* eslint-disable @next/next/no-page-custom-font */
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

import { baseUrl, siteName, slogan } from '@/constants/site';

export const GlobalHead: React.FC = () => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title key="title">{siteName}</title>
        <meta name="description" content={slogan} key="description" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00c69c" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/feed.xml"
          title="RSS2.0"
        />

        <meta property="og:title" key="og:title" content={siteName} />
        <meta
          property="og:image"
          key="og:image"
          content={`${baseUrl}/icon.png`}
        />
        <meta property="og:type" key="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="ja_JP" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" key="twitter:title" content={siteName} />
        <meta
          property="twitter:description"
          key="twitter:description"
          content={slogan}
        />
        <meta property="twitter:site" content="@kamatte_me" />
        <meta property="fb:app_id" content="159097111464111" />

        {/* Google Fonts */}
        {/* eslint-disable-next-line @next/next/google-font-display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&display=block"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/google-font-display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&text=plzkamte!&display=block"
          rel="stylesheet"
        />
      </Head>

      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-dataLayer"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TRACKING_ID}');`,
        }}
        strategy="afterInteractive"
      />

      {/* Unregister ServiceWorker */}
      <Script
        id="unregister-sw"
        dangerouslySetInnerHTML={{
          __html: `navigator.serviceWorker
                     .getRegistrations()
                     .then(function (registrations) {
                       registrations.forEach(registration => {
                         registration.unregister();
                       });
                     })
                     .catch(() => {});`,
        }}
        strategy="afterInteractive"
      />
    </>
  );
};
