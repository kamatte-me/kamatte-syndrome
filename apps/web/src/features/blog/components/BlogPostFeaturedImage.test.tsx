import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostFeaturedImage } from './BlogPostFeaturedImage';

describe('BlogPostFeaturedImage', () => {
  it('renders the featured image when provided', () => {
    render(<BlogPostFeaturedImage src="/media/example.png" title="Example" />);

    const image = screen.getByRole('img', { name: 'Example' });

    expect(image).toHaveAttribute('src', '/media/example.png');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute(
      'sizes',
      '(max-width: 639px) calc(100vw - 4rem), (max-width: 767px) calc(100vw - 10.125rem), (max-width: 935px) calc(100vw - 11.125rem), 760px',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders nothing without a featured image', () => {
    render(<BlogPostFeaturedImage src={undefined} title="Example" />);

    expect(screen.queryByRole('img')).toBeNull();
  });
});
