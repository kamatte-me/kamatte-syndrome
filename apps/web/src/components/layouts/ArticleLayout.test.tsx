import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArticleLayout } from './ArticleLayout';

describe('ArticleLayout', () => {
  it('renders the title, metadata, and body inside an article', () => {
    render(
      <ArticleLayout metadata="2026/7/11" title="Example Article">
        <p>Article body</p>
      </ArticleLayout>,
    );

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Example Article' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/7/11')).toBeInTheDocument();
    expect(screen.getByText('Article body')).toBeInTheDocument();
  });
});
