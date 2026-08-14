import { describe, expect, it } from 'vitest';
import { optimizedResponsiveImage } from './index.ts';
import { optimizedResponsiveImage as implementation } from './plugin.ts';

describe('optimized responsive image public API', () => {
  it('re-exports the Vite plugin factory', () => {
    expect(optimizedResponsiveImage).toBe(implementation);
  });
});
