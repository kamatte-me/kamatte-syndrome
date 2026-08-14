import { describe, expect, it, vi } from 'vitest';

const fetchOEmbedMetadata = vi.hoisted(() => vi.fn());

vi.mock('../server/oEmbed.server', () => ({
  fetchOEmbedMetadata,
}));

import { LinkCard } from './LinkCard';
import { OEmbed } from './OEmbed';
import { OEmbedView } from './OEmbedView';

describe('OEmbed', () => {
  it('renders the provider response when an oEmbed endpoint resolves', async () => {
    const metadata = {
      fetchedAt: '2026-08-12T00:00:00.000Z',
      html: '<iframe src="about:blank"></iframe>',
      type: 'video' as const,
      url: 'https://example.com/video',
      version: '1.0',
    };
    fetchOEmbedMetadata.mockResolvedValue(metadata);

    const element = await OEmbed({
      className: 'custom-embed',
      url: 'https://example.com/video',
    });

    expect(fetchOEmbedMetadata).toHaveBeenCalledWith(
      'https://example.com/video',
    );
    expect(element.type).toBe(OEmbedView);
    expect(element.props).toEqual({
      className: 'custom-embed',
      metadata,
      url: 'https://example.com/video',
    });
  });

  it('falls back to an Open Graph link card when no provider resolves', async () => {
    fetchOEmbedMetadata.mockResolvedValue(undefined);

    const element = await OEmbed({ url: 'https://example.com/article' });

    expect(element.type).toBe(LinkCard);
    expect(element.props).toEqual({
      className: undefined,
      url: 'https://example.com/article',
    });
  });
});
