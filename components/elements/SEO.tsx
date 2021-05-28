import Head from 'next/head';
import React from 'react';

import { siteName } from '@/constants/site';

export const SEO: React.FC<{
  title: string;
  description?: string | null;
  ogImageUrl?: string | null;
}> = ({ title, description, ogImageUrl }) => {
  return (
    <Head>
      <title key="title">
        {title} - {siteName}
      </title>
      <meta property="og:title" key="og:title" content={title} />

      {description && (
        <meta name="description" key="description" content={description} />
      )}
      {ogImageUrl && (
        <meta property="og:image" key="og:image" content={ogImageUrl} />
      )}
    </Head>
  );
};
