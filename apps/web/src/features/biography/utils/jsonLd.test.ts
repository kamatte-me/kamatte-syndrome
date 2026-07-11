import { describe, expect, it } from 'vitest';
import { author } from '@/constants/site';
import { createProfilePageStructuredData } from './jsonLd';

describe('createProfilePageStructuredData', () => {
  it('creates ProfilePage structured data for the biography page', () => {
    expect(
      createProfilePageStructuredData({
        dateModified: new Date('2026-07-12T00:00:00+09:00'),
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateModified: '2026-07-11T15:00:00.000Z',
      mainEntity: {
        '@type': 'Person',
        '@id': 'https://kamatte.me/biography#person',
        name: author,
        url: 'https://kamatte.me/biography',
        image: 'https://kamatte.me/avatar.png',
        sameAs: ['https://github.com/kamatte-me'],
      },
    });
  });
});
