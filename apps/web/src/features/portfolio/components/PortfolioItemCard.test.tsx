import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioListItem } from '../types';
import { PortfolioItemCard } from './PortfolioItemCard';

function createPortfolioItem(
  overrides: Partial<PortfolioListItem> = {},
): PortfolioListItem {
  return {
    body: (<p>Compact body</p>) as PortfolioListItem['body'],
    category: 'Website',
    image: '/media/example.png',
    link: 'https://example.com',
    name: 'Example Work',
    order: 1,
    slug: 'example-work',
    technologies: ['React', 'TypeScript'],
    year: 2026,
    ...overrides,
  };
}

describe('PortfolioItemCard', () => {
  it('renders linked portfolio details', () => {
    render(<PortfolioItemCard item={createPortfolioItem()} />);

    const titleLink = screen.getByRole('link', { name: 'Example Work' });

    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(titleLink).toHaveAttribute('href', 'https://example.com');
    expect(titleLink).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Compact body')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders an unlinked heading when the item has no link', () => {
    render(
      <PortfolioItemCard item={createPortfolioItem({ link: undefined })} />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Example Work' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Example Work' })).toBeNull();
  });
});
