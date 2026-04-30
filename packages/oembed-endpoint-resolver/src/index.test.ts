import { describe, expect, it } from 'vitest';
import { resolveOEmbedEndpoint } from './index.ts';

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
