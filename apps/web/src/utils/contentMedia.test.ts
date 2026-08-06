import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original',
  () => ({
    manifest: {
      '/media/example.png': { src: '/assets/example.hash.png' },
    },
  }),
);

import { resolveContentMediaUrl } from './contentMedia';

describe('resolveContentMediaUrl', () => {
  it('replaces known content media URLs with their Vite asset URLs', () => {
    expect(resolveContentMediaUrl('/media/example.png')).toBe(
      '/assets/example.hash.png',
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
