import Head from 'next/head';
import React from 'react';

export const GlobalHead: React.FC = () => {
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
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=block&text=plzkamte!"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&display=block"
        rel="stylesheet"
      />
    </Head>
  );
};
