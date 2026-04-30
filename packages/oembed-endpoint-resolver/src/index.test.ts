import { describe, expect, it, vi } from 'vitest';
import { resolveOEmbedEndpoint } from './index.ts';

vi.mock('oembed-providers/providers.json', () => ({
  default: [
    {
      provider_name: 'Mock Video',
      provider_url: 'https://video.example',
      endpoints: [
        {
          schemes: ['https://video.example/watch/*'],
          url: 'https://video.example/oembed',
          formats: ['json'],
        },
      ],
    },
    {
      provider_name: 'Mock Wildcard',
      provider_url: 'https://embed.example',
      endpoints: [
        {
          schemes: ['https://*.embed.example/videos/*'],
          url: 'https://embed.example/oembed',
          formats: ['json'],
        },
      ],
    },
  ],
}));

describe('resolveOEmbedEndpoint', () => {
  it('matches provider schemes for literal hosts', () => {
    const endpoint = resolveOEmbedEndpoint(
      'https://video.example/watch/GTjO6EuUcbY',
    );

    expect(endpoint).toMatchObject({
      providerName: 'Mock Video',
      endpointUrl: 'https://video.example/oembed',
    });
  });

  it('matches provider schemes with wildcard hosts', () => {
    const endpoint = resolveOEmbedEndpoint(
      'https://player.embed.example/videos/1',
    );

    expect(endpoint).toMatchObject({
      providerName: 'Mock Wildcard',
      endpointUrl: 'https://embed.example/oembed',
    });
  });

  it('does not match ordinary article URLs', () => {
    expect(
      resolveOEmbedEndpoint('https://example.com/posts/hello'),
    ).toBeUndefined();
  });
});
