import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/testing/setup-tests';
import { fetchOpenGraphMetadata } from './openGraph.server';

describe('fetchOpenGraphMetadata', () => {
  it('follows public redirects after validating each location', async () => {
    const requests: string[] = [];

    server.use(
      http.get('https://example.com/redirect', ({ request }) => {
        requests.push(request.url);

        return new HttpResponse(null, {
          headers: { Location: '/target' },
          status: 302,
        });
      }),
      http.get('https://example.com/target', ({ request }) => {
        requests.push(request.url);

        return new HttpResponse('<title>Redirect target</title>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }),
    );

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).resolves.toMatchObject({
      title: 'Redirect target',
    });

    expect(requests).toEqual([
      'https://example.com/redirect',
      'https://example.com/target',
    ]);
  });

  it('resolves relative metadata URLs against the final redirect target', async () => {
    server.use(
      http.get(
        'https://example.com/redirect',
        () =>
          new HttpResponse(null, {
            headers: { Location: 'https://target.example/posts/final' },
            status: 302,
          }),
      ),
      http.get(
        'https://target.example/posts/final',
        () =>
          new HttpResponse(
            `
            <title>Redirect target</title>
            <meta property="og:image" content="/card.png">
            <link rel="icon" href="favicon.ico">
          `,
            {
              headers: { 'Content-Type': 'text/html' },
            },
          ),
      ),
    );

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).resolves.toMatchObject({
      url: 'https://example.com/redirect',
      image: 'https://target.example/card.png',
      favicon: 'https://target.example/posts/favicon.ico',
    });
  });

  it('uses browser-like request headers for Open Graph fetches', async () => {
    const requests: {
      accept: string | null;
      acceptLanguage: string | null;
      url: string;
      userAgent: string | null;
    }[] = [];

    server.use(
      http.get('https://example.com/product', ({ request }) => {
        requests.push({
          accept: request.headers.get('accept'),
          acceptLanguage: request.headers.get('accept-language'),
          url: request.url,
          userAgent: request.headers.get('user-agent'),
        });

        return new HttpResponse('<title>Preview</title>', {
          headers: { 'Content-Type': 'text/html' },
        });
      }),
    );

    await fetchOpenGraphMetadata('https://example.com/product');

    expect(requests).toEqual([
      expect.objectContaining({
        accept: expect.stringContaining('text/html'),
        acceptLanguage: expect.stringContaining('ja'),
        url: 'https://example.com/product',
        userAgent: expect.stringContaining('Googlebot/2.1'),
      }),
    ]);
  });

  it('rejects redirects to blocked hosts', async () => {
    const requests: string[] = [];

    server.use(
      http.get('https://example.com/redirect', ({ request }) => {
        requests.push(request.url);

        return new HttpResponse(null, {
          headers: { Location: 'http://169.254.169.254/latest/meta-data' },
          status: 302,
        });
      }),
    );

    await expect(
      fetchOpenGraphMetadata('https://example.com/redirect'),
    ).rejects.toThrow('This URL host is not allowed.');

    expect(requests).toEqual(['https://example.com/redirect']);
  });

  it('rejects failed upstream responses', async () => {
    server.use(
      http.get('https://example.com/unavailable', () =>
        HttpResponse.text('Service unavailable', { status: 503 }),
      ),
    );

    await expect(
      fetchOpenGraphMetadata('https://example.com/unavailable'),
    ).rejects.toThrow('Open Graph request failed with 503.');
  });
});
