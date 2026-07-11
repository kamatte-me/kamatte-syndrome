import type { ProfilePage, WithContext } from 'schema-dts';
import {
  authorJsonLdId,
  authorProfileUrl,
  schemaOrgContext,
} from '@/constants/jsonLd';
import { author, authorGitHubUrl, baseUrl } from '@/constants/site';

type ProfilePageStructuredDataOptions = {
  dateModified?: Date;
};

export function createProfilePageStructuredData({
  dateModified,
}: ProfilePageStructuredDataOptions = {}): WithContext<ProfilePage> {
  return {
    '@context': schemaOrgContext,
    '@type': 'ProfilePage',
    dateModified: dateModified?.toISOString(),
    mainEntity: {
      '@type': 'Person',
      '@id': authorJsonLdId,
      name: author,
      url: authorProfileUrl,
      image: new URL('/avatar.png', baseUrl).href,
      sameAs: [authorGitHubUrl],
    },
  };
}
