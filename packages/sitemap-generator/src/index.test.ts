import { describe, expect, it } from 'vitest';
import { generateSitemapXml } from './index.ts';

describe('generateSitemapXml', () => {
  it('renders absolute loc values from site-relative paths', () => {
    const sitemap = generateSitemapXml('https://example.com', [
      { path: '/', priority: 1 },
      { path: '/blog/hello' },
    ]);

    expect(sitemap).toContain('<loc>https://example.com/</loc>');
    expect(sitemap).toContain('<loc>https://example.com/blog/hello</loc>');
  });

  it('escapes XML-sensitive characters in URLs and string lastmod values', () => {
    const sitemap = generateSitemapXml('https://example.com', [
      {
        path: '/blog?page=2&tag=<music>',
        lastmod: '2026-05-17T00:00:00+09:00',
      },
    ]);

    expect(sitemap).toContain(
      '<loc>https://example.com/blog?page=2&amp;tag=%3Cmusic%3E</loc>',
    );
    expect(sitemap).toContain('<lastmod>2026-05-17T00:00:00+09:00</lastmod>');
  });

  it('formats Date lastmod values as ISO strings', () => {
    const sitemap = generateSitemapXml('https://example.com', [
      {
        path: '/blog/hello',
        lastmod: new Date('2026-05-17T00:00:00+09:00'),
      },
    ]);

    expect(sitemap).toContain('<lastmod>2026-05-16T15:00:00.000Z</lastmod>');
  });

  it('omits optional fields when they are not provided', () => {
    const sitemap = generateSitemapXml('https://example.com', [{ path: '/' }]);

    expect(sitemap).not.toContain('<lastmod>');
    expect(sitemap).not.toContain('<changefreq>');
    expect(sitemap).not.toContain('<priority>');
  });

  it('renders entries in order with changefreq and priority', () => {
    const sitemap = generateSitemapXml('https://example.com', [
      { path: '/', changefreq: 'yearly', priority: 1 },
      { path: '/blog', changefreq: 'weekly', priority: 0.5 },
    ]);

    expect(sitemap).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://example.com/</loc>
          <changefreq>yearly</changefreq>
          <priority>1</priority>
        </url>
        <url>
          <loc>https://example.com/blog</loc>
          <changefreq>weekly</changefreq>
          <priority>0.5</priority>
        </url>
      </urlset>
      "
    `);
  });
});
