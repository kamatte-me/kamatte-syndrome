import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from './MarkdownContent';
import styles from './MarkdownContent.module.css';

describe('MarkdownContent', () => {
  it('renders children in the default prose wrapper and forwards div props', () => {
    render(
      <MarkdownContent
        aria-label="記事本文"
        className="tracking-wide"
        data-testid="markdown-content"
        id="post-body"
      >
        <h2>見出し</h2>
        <p>本文テキスト</p>
      </MarkdownContent>,
    );

    const content = screen.getByTestId('markdown-content');

    expect(content).toHaveAttribute('id', 'post-body');
    expect(content).toHaveAccessibleName('記事本文');
    expect(content).toHaveClass(styles.root);
    expect(content).toHaveClass(
      'prose',
      'prose-invert',
      'max-w-none',
      'prose-pre:border-0',
      'prose-li:marker:text-cutout-readable',
      '[&>:first-child]:mt-0',
      '[&>:last-child]:mb-0',
      'prose-p:my-5',
      'prose-ul:my-5',
      'text-base',
      'tracking-wide',
    );
    expect(screen.getByRole('heading', { name: '見出し' })).toBeInTheDocument();
    expect(screen.getByText('本文テキスト')).toBeInTheDocument();
  });

  it('uses compact typography classes when variant is compact', () => {
    render(
      <MarkdownContent data-testid="compact-content" variant="compact">
        <p>短い本文</p>
      </MarkdownContent>,
    );

    const content = screen.getByTestId('compact-content');

    expect(content).toHaveClass(
      'prose-li:my-0.5',
      'prose-p:my-2',
      'prose-headings:mt-4',
      'prose-headings:mb-1',
      'text-[15px]',
      'leading-6',
      '[&>:first-child]:mt-0',
      '[&>:last-child]:mb-0',
    );
    expect(content).not.toHaveClass('prose-p:my-5');
  });

  it('lets caller classes override conflicting Tailwind utilities', () => {
    render(
      <MarkdownContent className="text-lg leading-10" data-testid="content">
        <p>調整済み本文</p>
      </MarkdownContent>,
    );

    const content = screen.getByTestId('content');

    expect(content).toHaveClass('text-lg', 'leading-10');
    expect(content).not.toHaveClass('text-base');
  });
});
