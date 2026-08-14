import { describe, expect, it } from 'vitest';
import {
  createOEmbedRequestUrl,
  getOEmbedCacheTtlSeconds,
  normalizeOEmbedResponse,
} from './oEmbed';

describe('createOEmbedRequestUrl', () => {
  it('builds a provider request URL without accepting a client endpoint', () => {
    const requestUrl = createOEmbedRequestUrl(
      {
        providerName: 'Example Video',
        providerUrl: 'https://video.example',
        endpointUrl: 'https://video.example/oembed',
      },
      'https://video.example/watch/1',
    );

    expect(requestUrl).toContain('https://video.example/oembed?');
    expect(requestUrl).toContain('format=json');
    expect(requestUrl).toContain('url=https%3A%2F%2Fvideo.example%2Fwatch%2F1');
  });

  it('replaces endpoint format placeholders', () => {
    const requestUrl = createOEmbedRequestUrl(
      {
        providerName: 'Example',
        providerUrl: 'https://example.com',
        endpointUrl: 'https://example.com/oembed.{format}',
      },
      'https://example.com/watch/1',
    );

    expect(requestUrl).toContain('https://example.com/oembed.json?');
    expect(requestUrl).not.toContain('{format}');
  });
});

describe('normalizeOEmbedResponse', () => {
  it('normalizes renderable video responses', () => {
    const metadata = normalizeOEmbedResponse(
      {
        version: '1.0',
        type: 'video',
        title: 'Video title',
        html: '<iframe src="https://player.video.example/embed/1"></iframe>',
        width: 640,
        height: 360,
        cache_age: '3600',
      },
      'https://video.example/watch/1',
      '2026-04-26T00:00:00.000Z',
    );

    expect(metadata).toMatchObject({
      type: 'video',
      title: 'Video title',
      width: 640,
      height: 360,
      cacheAge: 3600,
      fetchedAt: '2026-04-26T00:00:00.000Z',
    });
  });

  it('accepts numeric 1.0 versions from provider responses', () => {
    const metadata = normalizeOEmbedResponse(
      {
        version: 1.0,
        type: 'rich',
        provider_name: 'Example Audio',
        title: 'Example track',
        html: '<iframe src="https://player.audio.example/?url=https%3A%2F%2Fapi.audio.example%2Ftracks%2F1"></iframe>',
        width: 720,
        height: 450,
      },
      'https://audio.example/tracks/1',
      '2026-04-26T00:00:00.000Z',
    );

    expect(metadata).toMatchObject({
      type: 'rich',
      version: '1.0',
      providerName: 'Example Audio',
      title: 'Example track',
    });
  });

  it('rejects non-renderable link responses', () => {
    expect(
      normalizeOEmbedResponse(
        {
          version: '1.0',
          type: 'link',
          title: 'Only metadata',
        },
        'https://example.com/link',
      ),
    ).toBeUndefined();
  });

  it('caps provider cache ages at seven days', () => {
    expect(
      getOEmbedCacheTtlSeconds({
        url: 'https://example.com',
        type: 'photo',
        version: '1.0',
        cacheAge: 60 * 60 * 24 * 30,
        photoUrl: 'https://example.com/photo.jpg',
        fetchedAt: '2026-04-26T00:00:00.000Z',
      }),
    ).toBe(60 * 60 * 24 * 7);
  });
});
