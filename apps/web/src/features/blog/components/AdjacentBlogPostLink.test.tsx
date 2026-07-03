import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { AdjacentBlogPostLink } from './AdjacentBlogPostLink';

describe('AdjacentBlogPostLink', () => {
  it('renders a previous post link', () => {
    renderWithRouter(
      <AdjacentBlogPostLink
        direction="previous"
        post={{ slug: 'older-post', title: 'Older Post' }}
      />,
      {
        initialLocation: '/blog/example-post',
      },
    );

    const link = screen.getByRole('link', { name: '前の記事: Older Post' });

    expect(link).toHaveAttribute('href', '/blog/older-post');
    expect(screen.getByText('前の記事')).toBeInTheDocument();
    expect(screen.getByText('Older Post')).toBeInTheDocument();
    expect(link.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });

  it('renders a next post link', () => {
    renderWithRouter(
      <AdjacentBlogPostLink
        direction="next"
        post={{ slug: 'newer-post', title: 'Newer Post' }}
      />,
      {
        initialLocation: '/blog/example-post',
      },
    );

    const link = screen.getByRole('link', { name: '次の記事: Newer Post' });

    expect(link).toHaveAttribute('href', '/blog/newer-post');
    expect(screen.getByText('次の記事')).toBeInTheDocument();
    expect(screen.getByText('Newer Post')).toBeInTheDocument();
    expect(link.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
});
