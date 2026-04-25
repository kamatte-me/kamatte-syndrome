import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LinkCardView } from './LinkCardView';

describe('LinkCardView', () => {
  it('renders a loading fallback with the destination domain', () => {
    const html = renderToStaticMarkup(
      <LinkCardView
        state={{ status: 'loading' }}
        url="https://example.com/posts/hello"
      />,
    );

    expect(html).toContain('example.com');
    expect(html).toContain('Loading');
  });

  it('renders fetched OGP metadata', () => {
    const html = renderToStaticMarkup(
      <LinkCardView
        state={{
          status: 'success',
          metadata: {
            url: 'https://example.com/posts/hello',
            title: 'Example title',
            description: 'Example description',
            image: 'https://example.com/card.png',
            siteName: 'Example Site',
            favicon: 'https://example.com/favicon.ico',
            fetchedAt: '2026-04-26T00:00:00.000Z',
          },
        }}
        url="https://example.com/posts/hello"
      />,
    );

    expect(html).toContain('Example title');
    expect(html).toContain('Example description');
    expect(html).toContain('Example Site');
    expect(html).toContain('https://example.com/card.png');
  });

  it('renders a stable fallback when OGP fetching fails', () => {
    const html = renderToStaticMarkup(
      <LinkCardView
        state={{ status: 'error', message: 'Network error' }}
        url="https://example.net/"
      />,
    );

    expect(html).toContain('example.net');
    expect(html).toContain('Preview unavailable');
  });
});
