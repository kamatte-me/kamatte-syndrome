import { describe, expect, it } from 'vitest';
import { createBlogPostFeaturedImageSizes } from './createBlogPostFeaturedImageSizes';

describe('createBlogPostFeaturedImageSizes', () => {
  it('limits portrait images by their rendered width at the maximum height', () => {
    expect(createBlogPostFeaturedImageSizes({ height: 960, width: 540 })).toBe(
      '(max-width: 639px) min(calc(100vw - 4rem), 225px), (max-width: 767px) min(calc(100vw - 10.125rem), 225px), (max-width: 935px) min(calc(100vw - 11.125rem), 225px), min(760px, 225px)',
    );
  });

  it('does not request a slot wider than a small source image', () => {
    expect(
      createBlogPostFeaturedImageSizes({ height: 288, width: 320 }),
    ).toContain('min(760px, 320px)');
  });

  it('rounds fractional rendered widths up', () => {
    expect(
      createBlogPostFeaturedImageSizes({ height: 900, width: 1200 }),
    ).toContain('min(760px, 534px)');
  });
});
