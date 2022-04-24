/* eslint-disable @next/next/no-page-custom-font */
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

export const GlobalHead: React.FC = () => {
  return (
    <>
      <Head>
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
    </>
  );
};
