import Head from 'next/head';
import React from 'react';

import { siteName } from '@/constants/site';

const extractDescription = (description: string): string => {
  if (description.length <= 100) {
    return description;
  }
  return `${description.substr(0, 99)}…`;
};

export const SEO: React.FC<{
  title: string;
  description?: string | null;
  ogImageUrl?: string | null;
  ogType?: 'website' | 'article' | null;
}> = ({ title, description, ogImageUrl, ogType }) => {
  return (
    <Head>
      <title key="title">
        {title} - {siteName}
      </title>
      <meta property="og:title" key="og:title" content={title} />

      {description && (
        <meta
          name="description"
          key="description"
          content={extractDescription(description)}
        />
      )}
      {ogImageUrl && (
        <meta property="og:image" key="og:image" content={ogImageUrl} />
      )}
      {ogType && <meta property="og:type" key="og:type" content={ogType} />}
    </Head>
  );
};
