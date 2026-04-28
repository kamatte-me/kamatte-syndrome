import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchOEmbedMetadata } from './oEmbed.server';

describe('fetchOEmbedMetadata', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns normalized metadata for successful provider responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
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
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('not found', { status: 404 })),
    );

    await expect(
      fetchOEmbedMetadata('https://www.youtube.com/watch?v=missing'),
    ).resolves.toBeUndefined();
  });

  it('returns undefined for invalid provider JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{', {
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );

    await expect(
      fetchOEmbedMetadata('https://www.youtube.com/watch?v=invalid'),
    ).resolves.toBeUndefined();
  });

  it('uses Googlebot user agent for provider requests', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        version: '1.0',
        type: 'video',
        html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
      }),
    );

    vi.stubGlobal('fetch', fetchMock);

    await fetchOEmbedMetadata('https://www.youtube.com/watch?v=example');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://www.youtube.com/oembed?'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'User-Agent': expect.stringContaining('Googlebot/2.1'),
        }),
      }),
    );
  });
});
