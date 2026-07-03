import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostFeaturedImage } from './BlogPostFeaturedImage';

describe('BlogPostFeaturedImage', () => {
  it('renders the featured image when provided', () => {
    render(<BlogPostFeaturedImage src="/media/example.png" title="Example" />);

    expect(screen.getByRole('img', { name: 'Example' })).toHaveAttribute(
      'src',
      '/media/example.png',
    );
  });

  it('renders nothing without a featured image', () => {
    render(<BlogPostFeaturedImage src={undefined} title="Example" />);

    expect(screen.queryByRole('img')).toBeNull();
  });
});
