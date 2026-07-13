import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'virtual:content-images?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;480;640;960',
  () => ({
    contentImageManifest: {},
    default: {},
  }),
);

import { contentImageMdxComponents } from './contentImageMdxComponents';

const MarkdownImage = contentImageMdxComponents.img;

describe('contentImageMdxComponents', () => {
  it('lazy-loads local media without linking it', () => {
    render(<MarkdownImage src="/media/example.jpg" alt="Example" />);

    const image = screen.getByRole('img', { name: 'Example' });

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute(
      'sizes',
      '(max-width: 528px) calc(100vw - 3rem), 480px',
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('preserves explicit loading and sizes values', () => {
    render(
      <MarkdownImage
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
});
