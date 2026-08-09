import { describe, expect, it } from 'vitest';
import {
  parseSocialImageCollectionVirtualModuleRequest,
  resolveSocialImageCollectionVirtualModule,
} from './virtual.ts';

describe('social image collection virtual module', () => {
  it('parses, normalizes, and validates a collection request', () => {
    expect(
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection?width=1200&base=media/&src=/content/media',
      ),
    ).toEqual({ base: '/media', src: '/content/media', width: 1200 });
    expect(
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection',
      ),
    ).toBeNull();
    expect(() =>
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection?base=/media&width=1200',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection?src=/content/media&base=/media&width=1200;1600',
      ),
    ).toThrow('width must be a positive integer');
    expect(() =>
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection?src=/content/media&base=/media&width=0',
      ),
    ).toThrow('width must be a positive integer');
    expect(() =>
      parseSocialImageCollectionVirtualModuleRequest(
        'virtual:optimized-social-image/collection?src=/content/media&base=/media&width=1200&formats=jpeg',
      ),
    ).toThrow('does not support the formats query parameter');
  });

  it('canonicalizes collection modules by source, base, and width', () => {
    const first = resolveSocialImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      width: 1200,
    });
    const equivalent = resolveSocialImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '../content/media',
      width: 1200,
    });
    const differentWidth = resolveSocialImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      width: 630,
    });

    expect(first.id).toMatch(
      /^\0virtual:optimized-social-image\/collection:resolved:[a-f0-9]{64}$/,
    );
    expect(first.id).toBe(equivalent.id);
    expect(first.id).not.toBe(differentWidth.id);
  });
});
