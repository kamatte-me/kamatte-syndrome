import { describe, expect, it } from 'vitest';
import { normalizeOpenGraphUrl, parseOpenGraphHtml } from './openGraph';

describe('normalizeOpenGraphUrl', () => {
  it('accepts public http and https URLs and removes hashes', () => {
    expect(normalizeOpenGraphUrl('https://example.com/post#section')).toBe(
      'https://example.com/post',
    );
  });

  it('rejects unsupported, credentialed, and local URLs', () => {
    expect(() => normalizeOpenGraphUrl('ftp://example.com')).toThrow();
    expect(() => normalizeOpenGraphUrl('https://user@example.com')).toThrow();
    expect(() => normalizeOpenGraphUrl('http://localhost:3000')).toThrow();
    expect(() => normalizeOpenGraphUrl('http://192.168.0.1')).toThrow();
  });
});

describe('parseOpenGraphHtml', () => {
  it('prefers OGP fields over document fallbacks', () => {
    const metadata = parseOpenGraphHtml(
      `
        <html>
          <head>
            <title>Fallback title</title>
            <meta name="description" content="Fallback description">
            <meta property="og:title" content="OG title">
            <meta property="og:description" content="OG description">
            <meta property="og:image" content="/images/card.png">
            <meta property="og:site_name" content="Example Site">
            <link rel="icon" href="/favicon.ico">
          </head>
        </html>
      `,
      'https://example.com/posts/hello',
      '2026-04-26T00:00:00.000Z',
    );

    expect(metadata).toEqual({
      url: 'https://example.com/posts/hello',
      title: 'OG title',
      description: 'OG description',
      image: 'https://example.com/images/card.png',
      siteName: 'Example Site',
      favicon: 'https://example.com/favicon.ico',
      fetchedAt: '2026-04-26T00:00:00.000Z',
    });
  });

  it('falls back to title and description meta tags', () => {
    const metadata = parseOpenGraphHtml(
      `
        <title>Plain title &amp; value</title>
        <meta name="description" content="Plain description">
      `,
      'https://example.net/',
      '2026-04-26T00:00:00.000Z',
    );

    expect(metadata.title).toBe('Plain title & value');
    expect(metadata.description).toBe('Plain description');
  });
});
