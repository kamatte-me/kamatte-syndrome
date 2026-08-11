import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchOpenGraph: vi.fn(),
  getOpenGraph: vi.fn(),
  useServerFn: vi.fn(),
}));

vi.mock('@tanstack/react-start', () => ({
  useServerFn: mocks.useServerFn,
}));

vi.mock('../api/openGraph.functions', () => ({
  getOpenGraph: mocks.getOpenGraph,
}));

import { LinkCard } from './LinkCard';

afterEach(() => {
  vi.clearAllMocks();
});

describe('LinkCard', () => {
  it('renders Open Graph metadata returned by its server function', async () => {
    mocks.fetchOpenGraph.mockResolvedValue({
      fetchedAt: '2026-08-12T00:00:00.000Z',
      siteName: 'Example',
      title: 'Example title',
      url: 'https://example.com/article',
    });
    mocks.useServerFn.mockReturnValue(mocks.fetchOpenGraph);

    render(
      <LinkCard className="custom-card" url="https://example.com/article" />,
    );

    expect(await screen.findByText('Example title')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveClass('custom-card');
    expect(mocks.useServerFn).toHaveBeenCalledWith(mocks.getOpenGraph);
    expect(mocks.fetchOpenGraph).toHaveBeenCalledWith({
      data: { url: 'https://example.com/article' },
    });
  });

  it('shows an unavailable preview state when metadata fetching fails', async () => {
    mocks.fetchOpenGraph.mockRejectedValue(new Error('Preview failed'));
    mocks.useServerFn.mockReturnValue(mocks.fetchOpenGraph);

    render(<LinkCard url="https://example.com/article" />);

    await waitFor(() => {
      expect(mocks.fetchOpenGraph).toHaveBeenCalledWith({
        data: { url: 'https://example.com/article' },
      });
    });

    expect(screen.getAllByText('example.com')).toHaveLength(2);
    expect(screen.queryByText('Preview unavailable')).not.toBeInTheDocument();
  });
});
