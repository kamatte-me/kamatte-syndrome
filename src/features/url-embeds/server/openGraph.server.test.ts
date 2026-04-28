import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchOpenGraphMetadata } from './openGraph.server';

describe('fetchOpenGraphMetadata', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('follows public redirects after validating each location', async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href === 'https://example.com/redirect') {
        return new Response(null, {
          headers: { Location: '/target' },
          status: 302,
        });
      }

      if (href === 'https://example.com/target') {
        return new Response('<title>Redirect target</title>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      throw new Error(`Unexpected fetch: ${href}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).resolves.toMatchObject({
      title: 'Redirect target',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('resolves relative metadata URLs against the final redirect target', async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href === 'https://example.com/redirect') {
        return new Response(null, {
          headers: { Location: 'https://target.example/posts/final' },
          status: 302,
        });
      }

      if (href === 'https://target.example/posts/final') {
        return new Response(
          `
            <title>Redirect target</title>
            <meta property="og:image" content="/card.png">
            <link rel="icon" href="favicon.ico">
          `,
          {
            headers: { 'Content-Type': 'text/html' },
          },
        );
      }

      throw new Error(`Unexpected fetch: ${href}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).resolves.toMatchObject({
      url: 'https://example.com/redirect',
      image: 'https://target.example/card.png',
      favicon: 'https://target.example/posts/favicon.ico',
    });
  });

  it('uses browser-like request headers for Open Graph fetches', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response('<title>Preview</title>', {
          headers: { 'Content-Type': 'text/html' },
        }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await fetchOpenGraphMetadata('https://example.com/product');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/product',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining('text/html'),
          'Accept-Language': expect.stringContaining('ja'),
          'User-Agent': expect.stringContaining('Googlebot/2.1'),
        }),
      }),
    );
  });

  it('does not follow redirects to blocked hosts', async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);

      if (href === 'https://example.com/redirect') {
        return new Response(null, {
          headers: { Location: 'http://169.254.169.254/latest/meta-data' },
          status: 302,
        });
      }

      throw new Error(`Unexpected fetch: ${href}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).resolves.toMatchObject({
      url: 'https://example.com/redirect',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
