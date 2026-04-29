import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw';
import { fetchOEmbedMetadata } from './oEmbed.server';

describe('fetchOEmbedMetadata', () => {
  it('returns normalized metadata for successful provider responses', async () => {
    server.use(
      http.get('https://www.youtube.com/oembed', () =>
        HttpResponse.json({
          version: '1.0',
          type: 'video',
          html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
          width: 640,
          height: 360,
        }),
      ),
    );

    await expect(
      fetchOEmbedMetadata('https://www.youtube.com/watch?v=example'),
    ).resolves.toMatchObject({
      type: 'video',
      html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
    });
  });

  it('returns undefined for failed provider responses', async () => {
    server.use(
      http.get('https://www.youtube.com/oembed', () =>
        HttpResponse.text('not found', { status: 404 }),
      ),
    );

    await expect(
      fetchOEmbedMetadata('https://www.youtube.com/watch?v=missing'),
    ).resolves.toBeUndefined();
  });

  it('returns undefined for invalid provider JSON', async () => {
    server.use(
      http.get(
        'https://www.youtube.com/oembed',
        () =>
          new HttpResponse('{', {
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );

    await expect(
      fetchOEmbedMetadata('https://www.youtube.com/watch?v=invalid'),
    ).resolves.toBeUndefined();
  });

  it('returns undefined for unsafe source URLs before provider requests', async () => {
    const requests: string[] = [];

    server.use(
      http.get('https://www.youtube.com/oembed', ({ request }) => {
        requests.push(request.url);

        return HttpResponse.json({
          version: '1.0',
          type: 'video',
          html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
        });
      }),
    );

    await expect(
      fetchOEmbedMetadata('https://user@www.youtube.com/watch?v=example'),
    ).resolves.toBeUndefined();

    expect(requests).toHaveLength(0);
  });

  it('uses Googlebot user agent for provider requests', async () => {
    const requests: Array<{
      accept: string | null;
      url: string;
      userAgent: string | null;
    }> = [];

    server.use(
      http.get('https://www.youtube.com/oembed', ({ request }) => {
        requests.push({
          accept: request.headers.get('accept'),
          url: request.url,
          userAgent: request.headers.get('user-agent'),
        });

        return HttpResponse.json({
          version: '1.0',
          type: 'video',
          html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
        });
      }),
    );

    await fetchOEmbedMetadata('https://www.youtube.com/watch?v=example');

    expect(requests).toEqual([
      expect.objectContaining({
        accept: 'application/json',
        url: expect.stringContaining('https://www.youtube.com/oembed?'),
        userAgent: expect.stringContaining('Googlebot/2.1'),
      }),
    ]);
  });
});
