import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostArticle } from './BlogPostArticle';

describe('BlogPostArticle', () => {
  it('renders children inside the article wrapper', () => {
    render(
      <BlogPostArticle aria-label="Article" className="mx-auto">
        <p>Article body</p>
      </BlogPostArticle>,
    );

    expect(screen.getByRole('article', { name: 'Article' })).toHaveClass(
      'border',
      'border-cutout-hole',
      'p-7',
      'sm:p-9',
      'mx-auto',
    );
    expect(screen.getByText('Article body')).toBeInTheDocument();
  });
});
