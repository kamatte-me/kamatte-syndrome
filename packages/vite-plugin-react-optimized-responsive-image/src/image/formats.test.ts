import { imageSourceExtensions as coreImageSourceExtensions } from '@kamatte-syndrome/image-optimization-core';
import { describe, expect, it } from 'vitest';
import { imageSourceExtensions } from './formats.ts';

describe('imageSourceExtensions', () => {
  it('re-exports the shared decoder input formats', () => {
    expect(imageSourceExtensions).toBe(coreImageSourceExtensions);
    expect(imageSourceExtensions).toContain('.webp');
  });
});
