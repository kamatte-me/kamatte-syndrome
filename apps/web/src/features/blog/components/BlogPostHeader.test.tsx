import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogPostHeader } from './BlogPostHeader';

describe('BlogPostHeader', () => {
  it('renders the post title and published date', () => {
    render(
      <BlogPostHeader
        publishedAt={new Date('2026-07-03T10:00:00+09:00')}
        title="Example Post"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Example Post' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2026/7/3')).toBeInTheDocument();
  });
});
