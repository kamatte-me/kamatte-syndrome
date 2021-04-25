import React from 'react';
import { Helmet } from 'react-helmet';

const Head: React.FC = () => {
  return (
    <Helmet htmlAttributes={{ lang: 'ja-JP' }}>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>かまって☆しんどろ〜む</title>
      <meta name="description" content="plz kamatte me!!!" />
      <meta property="og:site_name" content="かまって☆しんどろ〜む" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://kamatte.me/icon.png" />
      <meta property="og:locale" content="ja_JP" />
      <meta property="twitter:card" content="summary" />
      <meta property="fb:app_id" content="159097111464111" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Josefin+Sans:300,400"
      />
    </Helmet>
  );
};

export default Head;
