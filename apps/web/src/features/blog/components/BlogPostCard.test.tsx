import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import type { BlogListPost } from '../types';
import { BlogPostCard } from './BlogPostCard';

function createPost(overrides: Partial<BlogListPost> = {}): BlogListPost {
  return {
    featuredImage: '/media/example.png',
    publishedAt: new Date('2026-07-03T10:00:00+09:00'),
    slug: 'example-post',
    title: 'Example Post',
    ...overrides,
  };
}

describe('BlogPostCard', () => {
  it('renders the linked post summary without changing the card content', () => {
    renderWithRouter(<BlogPostCard post={createPost()} />);

    const link = screen.getByRole('link', { name: /Example Post/ });

    expect(link).toHaveAttribute('href', '/blog/example-post');
    expect(screen.getByRole('img', { name: 'Example Post' })).toHaveAttribute(
      'src',
      '/media/example.png',
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Example Post' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026年7月3日')).toBeInTheDocument();
  });

  it('uses the avatar image when the post has no featured image', () => {
    renderWithRouter(
      <BlogPostCard post={createPost({ featuredImage: undefined })} />,
    );

    expect(screen.getByRole('img', { name: 'Example Post' })).toHaveAttribute(
      'src',
      '/avatar.svg',
    );
  });
});
