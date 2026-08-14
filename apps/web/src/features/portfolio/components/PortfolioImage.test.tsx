import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioListItem } from '../types';
import { PortfolioImage } from './PortfolioImage';

function createPortfolioItem(
  overrides: Partial<PortfolioListItem> = {},
): PortfolioListItem {
  return {
    body: (<p>Body</p>) as PortfolioListItem['body'],
    category: 'Web',
    image: '/media/example.png',
    link: 'https://example.com',
    name: 'Example Work',
    order: 1,
    slug: 'example-work',
    technologies: ['React'],
    year: 2026,
    ...overrides,
  };
}

describe('PortfolioImage', () => {
  it('renders an image when the item has one', () => {
    render(<PortfolioImage item={createPortfolioItem()} />);

    const image = screen.getByRole('img', { name: 'Example Work' });

    expect(image).toHaveAttribute('src', '/media/example.png');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('sizes', '(min-width: 640px) 176px, 160px');
    expect(image).toHaveAttribute('width', '176');
    expect(image).toHaveAttribute('height', '176');
  });

  it('wraps the image in an external link when a link is supplied', () => {
    render(
      <PortfolioImage
        item={createPortfolioItem()}
        link="https://example.com"
      />,
    );

    const link = screen.getByRole('link', { name: 'Example Work を開く' });

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders the placeholder when the item has no image', () => {
    render(<PortfolioImage item={createPortfolioItem({ image: undefined })} />);

    expect(screen.getByText('大人の事情で')).toBeInTheDocument();
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });
});
