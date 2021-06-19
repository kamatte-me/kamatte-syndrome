import Head from 'next/head';
import React, { useMemo } from 'react';

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
  const formattedTitle = `${title} - ${siteName}`;
  const formattedDescription: string | null = useMemo(() => {
    if (description) {
      return extractDescription(description);
    }
    return null;
  }, [description]);

  return (
    <Head>
      <title key="title">{formattedTitle}</title>
      <meta property="og:title" key="og:title" content={title} />
      <meta
        property="twitter:title"
        key="twitter:title"
        content={formattedTitle}
      />

      {formattedDescription && (
        <>
          <meta
            name="description"
            key="description"
            content={formattedDescription}
          />
          <meta
            property="twitter:description"
            key="twitter:description"
            content={formattedDescription}
          />
        </>
      )}
      {ogImageUrl && (
        <meta property="og:image" key="og:image" content={ogImageUrl} />
      )}
      {ogType && <meta property="og:type" key="og:type" content={ogType} />}
    </Head>
  );
};
