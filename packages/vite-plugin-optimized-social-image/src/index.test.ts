import { describe, expect, it } from 'vitest';
import { optimizedSocialImage } from './index.ts';
import { optimizedSocialImage as implementation } from './plugin.ts';

describe('optimized social image public API', () => {
  it('re-exports the Vite plugin factory', () => {
    expect(optimizedSocialImage).toBe(implementation);
  });
});
