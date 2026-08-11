import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LinkCardView } from './LinkCardView';

describe('LinkCardView', () => {
  it('renders a destination fallback without a loading label', () => {
    render(
      <LinkCardView
        className="my-6"
        state={{ status: 'loading' }}
        url="https://www.example.com/posts/hello"
      />,
    );

    const link = screen.getByRole('link', { name: /www\.example\.com/i });
    expect(link).toHaveAttribute('href', 'https://www.example.com/posts/hello');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.className).toContain('h-32');
    expect(link.className).toContain('my-6');
    expect(screen.getAllByText('www.example.com')).toHaveLength(2);
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('renders fetched OGP metadata', () => {
    const { container } = render(
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

    const link = screen.getByRole('link', { name: /Example title/i });
    const image = container.querySelector(
      'img[src="https://example.com/card.png"]',
    );
    const imageShell = image?.parentElement;

    expect(link).toHaveAttribute('href', 'https://example.com/posts/hello');
    expect(link.className).toContain('h-32');
    expect(screen.getByText('Example title')).toBeInTheDocument();
    expect(screen.getByText('Example description')).toBeInTheDocument();
    expect(screen.getByText('Example Site')).toBeInTheDocument();
    expect(image).not.toBeNull();
    expect(imageShell?.className.split(/\s+/)).not.toContain('hidden');
  });

  it('renders the same fallback without an error label when OGP fetching fails', () => {
    render(
      <LinkCardView
        state={{ status: 'error', message: 'Network error' }}
        url="https://example.net/"
      />,
    );

    const link = screen.getByRole('link', { name: /example\.net/i });
    expect(link).toHaveAttribute('href', 'https://example.net/');
    expect(screen.getAllByText('example.net')).toHaveLength(2);
    expect(screen.queryByText('Preview unavailable')).not.toBeInTheDocument();
  });
});
