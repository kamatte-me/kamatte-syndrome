import { describe, expect, it } from 'vitest';
import { siteName } from '@/constants/site';
import { websiteStructuredData } from './jsonLd';

describe('websiteStructuredData', () => {
  it('describes the website root', () => {
    expect(websiteStructuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: 'https://kamatte.me/',
    });
  });
});
