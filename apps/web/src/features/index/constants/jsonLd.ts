import type { WebSite, WithContext } from 'schema-dts';
import { schemaOrgContext } from '@/constants/jsonLd';
import { baseUrl, siteName } from '@/constants/site';

export const websiteStructuredData = {
  '@context': schemaOrgContext,
  '@type': 'WebSite',
  name: siteName,
  url: new URL('/', baseUrl).href,
} satisfies WithContext<WebSite>;
