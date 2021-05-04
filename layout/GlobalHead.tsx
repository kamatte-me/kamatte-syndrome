import Head from 'next/head';
import React, { useEffect } from 'react';

export const GlobalHead: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line global-require
      const WebFontLoader = require('webfontloader');

      WebFontLoader.load({
        google: {
          families: ['Caveat:700', 'Josefin Sans:400,700'],
          timeout: 2000,
        },
      });
    }
  }, []);

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title key="title">かまって☆しんどろ〜む</title>
      <meta name="description" content="plz kamatte me!!!" key="description" />
      <meta
        property="og:image"
        content="https://kamatte.me/icon.png"
        key="og:image"
      />
      <meta property="og:site_name" content="かまって☆しんどろ〜む" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="ja_JP" />
      <meta property="twitter:card" content="summary" />
      <meta property="fb:app_id" content="159097111464111" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
};
