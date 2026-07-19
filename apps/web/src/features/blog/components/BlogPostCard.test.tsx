import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import avatarImage from '@/assets/avatar.svg';
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
    const image = screen.getByRole('img', { name: 'Example Post' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('sizes', '(min-width: 640px) 120px, 72px');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Example Post' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/7/3')).toBeInTheDocument();
  });

  it('uses the avatar image when the post has no featured image', () => {
    renderWithRouter(
      <BlogPostCard post={createPost({ featuredImage: undefined })} />,
    );

    expect(screen.getByRole('img', { name: 'Example Post' })).toHaveAttribute(
      'src',
      avatarImage,
    );
  });
});
