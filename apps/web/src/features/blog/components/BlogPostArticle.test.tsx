import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostArticle } from './BlogPostArticle';

describe('BlogPostArticle', () => {
  it('renders children inside the article wrapper', () => {
    render(
      <BlogPostArticle aria-label="Article">
        <p>Article body</p>
      </BlogPostArticle>,
    );

    expect(
      screen.getByRole('article', { name: 'Article' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Article body')).toBeInTheDocument();
  });
});
