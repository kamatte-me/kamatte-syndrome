import { describe, expect, it } from 'vitest';
import {
  createOEmbedRequestUrl,
  getOEmbedCacheTtlSeconds,
  normalizeOEmbedResponse,
  resolveOEmbedEndpoint,
} from './oEmbed';

describe('resolveOEmbedEndpoint', () => {
  it('matches registry schemes for YouTube URLs', () => {
    const endpoint = resolveOEmbedEndpoint(
      'https://www.youtube.com/watch?v=GTjO6EuUcbY',
    );

    expect(endpoint).toMatchObject({
      providerName: 'YouTube',
      endpointUrl: 'https://www.youtube.com/oembed',
    });
  });

  it('does not match ordinary article URLs', () => {
    expect(
      resolveOEmbedEndpoint('https://example.com/posts/hello'),
    ).toBeUndefined();
  });
});

describe('createOEmbedRequestUrl', () => {
  it('builds a provider request URL without accepting a client endpoint', () => {
    const endpoint = resolveOEmbedEndpoint('https://youtu.be/GTjO6EuUcbY');
    expect(endpoint).toBeDefined();
    if (!endpoint) {
      throw new Error('Expected a YouTube oEmbed endpoint.');
    }

    const requestUrl = createOEmbedRequestUrl(
      endpoint,
      'https://youtu.be/GTjO6EuUcbY',
    );

    expect(requestUrl).toContain('https://www.youtube.com/oembed?');
    expect(requestUrl).toContain('format=json');
    expect(requestUrl).toContain('url=https%3A%2F%2Fyoutu.be%2FGTjO6EuUcbY');
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
        html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
        width: 640,
        height: 360,
        cache_age: '3600',
      },
      'https://www.youtube.com/watch?v=example',
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

  it('accepts numeric 1.0 versions from SoundCloud responses', () => {
    const metadata = normalizeOEmbedResponse(
      {
        version: 1.0,
        type: 'rich',
        provider_name: 'SoundCloud',
        title: 'ドアノブロック Official',
        html: '<iframe src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Fusers%2F325109560"></iframe>',
        width: 720,
        height: 450,
      },
      'https://soundcloud.com/official-163840861',
      '2026-04-26T00:00:00.000Z',
    );

    expect(metadata).toMatchObject({
      type: 'rich',
      version: '1.0',
      providerName: 'SoundCloud',
      title: 'ドアノブロック Official',
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
