import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MarkdownContentImage } from './MarkdownContentImage';

describe('MarkdownContentImage', () => {
  it('lazy-loads local media without linking it', () => {
    render(<MarkdownContentImage src="/media/example.jpg" alt="Example" />);

    const image = screen.getByRole('img', { name: 'Example' });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute(
      'sizes',
      'auto, (max-width: 528px) calc(100vw - 3rem), 480px',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('preserves explicit loading and sizes values', () => {
    render(
      <MarkdownContentImage
        src="/media/hero.jpg"
        alt="Hero"
        loading="eager"
        sizes="100vw"
      />,
    );

    const image = screen.getByRole('img', { name: 'Hero' });
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image).toHaveAttribute('sizes', '100vw');
  });

  it('omits auto sizes when explicitly loaded eagerly', () => {
    render(
      <MarkdownContentImage src="/media/hero.jpg" alt="Hero" loading="eager" />,
    );

    expect(screen.getByRole('img', { name: 'Hero' })).toHaveAttribute(
      'sizes',
      '(max-width: 528px) calc(100vw - 3rem), 480px',
    );
  });

  it('renders a normal image when MDX does not provide a string source', () => {
    render(<MarkdownContentImage alt="Missing source" />);

    const image = screen.getByRole('img', { name: 'Missing source' });
    expect(image).not.toHaveAttribute('src');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});
