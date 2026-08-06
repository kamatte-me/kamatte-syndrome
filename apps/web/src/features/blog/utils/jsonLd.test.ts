import { describe, expect, it, vi } from 'vitest';
import { author } from '@/constants/site';
import { createJsonLdScript } from '@/utils/jsonLd';

vi.mock(
  'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original',
  () => ({
    manifest: {
      '/media/example.png': { src: '/assets/example.hash.png' },
    },
  }),
);

import {
  createBlogBreadcrumbStructuredData,
  createBlogPostingStructuredData,
} from './jsonLd';

describe('createBlogPostingStructuredData', () => {
  it('creates BlogPosting structured data with available article metadata', () => {
    expect(
      createBlogPostingStructuredData({
        title: 'Article title',
        description: 'Article description',
        slug: 'example',
        featuredImage: '/media/example.png',
        publishedAt: new Date('2026-07-10T10:00:00+09:00'),
        revisedAt: new Date('2026-07-11T11:00:00+09:00'),
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': 'https://kamatte.me/blog/example#article',
      headline: 'Article title',
      description: 'Article description',
      url: 'https://kamatte.me/blog/example',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://kamatte.me/blog/example',
      },
      image: 'https://kamatte.me/assets/example.hash.png',
      datePublished: '2026-07-10T01:00:00.000Z',
      dateModified: '2026-07-11T02:00:00.000Z',
      author: {
        '@type': 'Person',
        '@id': 'https://kamatte.me/biography#person',
        name: author,
        url: 'https://kamatte.me/biography',
      },
    });
  });

  it('omits unavailable optional article metadata when serialized', () => {
    const script = createJsonLdScript(
      createBlogPostingStructuredData({
        title: 'Article title',
        description: 'Article description',
        slug: 'example',
      }),
    );
    const data = JSON.parse(script.children);

    expect(data).not.toHaveProperty('image');
    expect(data).not.toHaveProperty('datePublished');
    expect(data).not.toHaveProperty('dateModified');
  });
});

describe('createBlogBreadcrumbStructuredData', () => {
  it('creates a two-level blog breadcrumb', () => {
    expect(
      createBlogBreadcrumbStructuredData({
        title: 'Article title',
        slug: 'example',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Blog',
          item: 'https://kamatte.me/blog',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Article title',
          item: 'https://kamatte.me/blog/example',
        },
      ],
    });
  });
});
