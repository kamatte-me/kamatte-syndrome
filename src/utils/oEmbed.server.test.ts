import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchOEmbedMetadata } from './oEmbed.server';

describe('fetchOEmbedMetadata', () => {
  afterEach(() => {
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
});
