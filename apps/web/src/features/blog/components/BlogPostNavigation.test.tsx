import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { BlogPostNavigation } from './BlogPostNavigation';

describe('BlogPostNavigation', () => {
  it('renders adjacent post links', () => {
    renderWithRouter(
      <BlogPostNavigation
        next={{ slug: 'newer-post', title: 'Newer Post' }}
        previous={{ slug: 'older-post', title: 'Older Post' }}
      />,
      {
        initialLocation: '/blog/example-post',
      },
    );

    expect(
      screen.getByRole('link', { name: '前の記事: Older Post' }),
    ).toHaveAttribute('href', '/blog/older-post');
    expect(
      screen.getByRole('link', { name: '次の記事: Newer Post' }),
    ).toHaveAttribute('href', '/blog/newer-post');
  });

  it('renders nothing without adjacent posts', () => {
    renderWithRouter(<BlogPostNavigation next={null} previous={null} />);

    expect(screen.queryByRole('navigation', { name: '前後の記事' })).toBeNull();
  });
});
