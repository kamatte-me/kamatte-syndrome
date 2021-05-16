import Head from 'next/head';
import React from 'react';

import { siteName } from '@/constants/site';

export const SEO: React.FC<{
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
}> = ({ title, description, ogImageUrl }) => {
  return (
    <Head>
      <title key="title">
        {title} - {siteName}
      </title>
      {description && (
        <meta name="description" content={description} key="description" />
      )}
      {ogImageUrl && (
        <meta property="og:image" content={ogImageUrl} key="og:image" />
      )}
    </Head>
  );
};
