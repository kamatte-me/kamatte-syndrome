import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostBody } from './BlogPostBody';

describe('BlogPostBody', () => {
  it('renders article body content', () => {
    render(
      <BlogPostBody>
        <p>Article body</p>
        <img alt="Inline media" src="/media/example.png" />
      </BlogPostBody>,
    );

    expect(screen.getByText('Article body')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Inline media' })).toHaveAttribute(
      'src',
      '/media/example.png',
    );
  });
});
