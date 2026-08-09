import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'virtual:optimized-social-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&width=1200',
  () => ({
    manifest: {
      '/media/example.gif': {
        format: 'gif',
        height: 800,
        src: '/assets/example.1200x800.hash.gif',
        width: 1200,
      },
      '/media/example.jpg': {
        format: 'jpeg',
        height: 800,
        src: '/assets/example.1200x800.hash.jpeg',
        width: 1200,
      },
      '/media/example.png': {
        format: 'png',
        height: 800,
        src: '/assets/example.1200x800.hash.png',
        width: 1200,
      },
      '/media/transparent.webp': {
        format: 'png',
        height: 800,
        src: '/assets/example.1200x800.hash.png',
        width: 1200,
      },
    },
  }),
);

import { resolveContentMediaUrl } from './contentMedia';

describe('resolveContentMediaUrl', () => {
  it('returns the generated social image URL', () => {
    expect(resolveContentMediaUrl('/media/example.png')).toBe(
      '/assets/example.1200x800.hash.png',
    );
    expect(resolveContentMediaUrl('/media/example.jpg')).toBe(
      '/assets/example.1200x800.hash.jpeg',
    );
    expect(resolveContentMediaUrl('/media/example.gif')).toBe(
      '/assets/example.1200x800.hash.gif',
    );
    expect(resolveContentMediaUrl('/media/transparent.webp')).toBe(
      '/assets/example.1200x800.hash.png',
    );
  });

  it('preserves unknown and absent URLs', () => {
    expect(resolveContentMediaUrl('/avatar.png')).toBe('/avatar.png');
    expect(resolveContentMediaUrl('https://example.com/image.png')).toBe(
      'https://example.com/image.png',
    );
    expect(resolveContentMediaUrl(undefined)).toBeUndefined();
  });
});
