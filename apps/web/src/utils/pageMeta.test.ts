import { describe, expect, it } from 'vitest';
import { siteName } from '@/constants/site';
import {
  createCanonicalLink,
  createPageMeta,
  formatPageTitle,
} from './pageMeta';

describe('createCanonicalLink', () => {
  it('creates an absolute canonical URL while preserving search parameters', () => {
    expect(createCanonicalLink('/blog?page=2')).toEqual({
      rel: 'canonical',
      href: 'https://kamatte.me/blog?page=2',
    });
  });
});

describe('formatPageTitle', () => {
  it('appends the site name to a page title', () => {
    expect(formatPageTitle('Blog')).toBe(`Blog - ${siteName}`);
  });
});

describe('createPageMeta', () => {
  it('creates Open Graph metadata with absolute URLs', () => {
    expect(
      createPageMeta({
        title: 'Article title',
        openGraphTitle: 'OG article title',
        description: 'Article description',
        path: '/blog/example',
        image: '/media/example.png',
        type: 'article',
      }),
    ).toEqual([
      { title: 'Article title' },
      { name: 'description', content: 'Article description' },
      { property: 'og:title', content: 'OG article title' },
      { property: 'og:description', content: 'Article description' },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: 'https://kamatte.me/blog/example' },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'ja_JP' },
      { property: 'og:image', content: 'https://kamatte.me/media/example.png' },
    ]);
  });

  it('uses the site icon and website type by default', () => {
    const meta = createPageMeta({
      title: siteName,
      description: 'Site description',
      path: '/',
    });

    expect(meta).toContainEqual({ property: 'og:type', content: 'website' });
    expect(meta).toContainEqual({
      property: 'og:image',
      content: 'https://kamatte.me/icon.png',
    });
  });
});
