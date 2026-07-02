import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostList } from './BlogPostList';

describe('BlogPostList', () => {
  it('renders children inside the styled list wrapper', () => {
    render(
      <BlogPostList aria-label="Posts">
        <li>First Post</li>
        <li>Second Post</li>
      </BlogPostList>,
    );

    expect(screen.getByRole('list', { name: 'Posts' })).toHaveClass(
      'grid',
      'gap-5',
    );
    expect(screen.getByText('First Post')).toBeInTheDocument();
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });
});
