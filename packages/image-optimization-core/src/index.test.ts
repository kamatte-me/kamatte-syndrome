import { describe, expect, it } from 'vitest';
import { imageSourceExtensions, isPathInside } from './files.ts';
import * as publicApi from './index.ts';
import { getImageDisplayDimensions } from './sharp.ts';
import { normalizeViteBasePath } from './vite.ts';

describe('image optimization core public API', () => {
  it('re-exports its supported runtime helpers', () => {
    expect(publicApi.imageSourceExtensions).toBe(imageSourceExtensions);
    expect(publicApi.isPathInside).toBe(isPathInside);
    expect(publicApi.getImageDisplayDimensions).toBe(getImageDisplayDimensions);
    expect(publicApi.normalizeViteBasePath).toBe(normalizeViteBasePath);
    expect(publicApi.readCachedAsset).toBeTypeOf('function');
    expect(publicApi.writeCachedAsset).toBeTypeOf('function');
    expect(publicApi.listSupportedImageFiles).toBeTypeOf('function');
    expect(publicApi.toPosixPath).toBeTypeOf('function');
    expect(publicApi.getSharpEncoderVersion).toBeTypeOf('function');
    expect(publicApi.createViteAssetUrl).toBeTypeOf('function');
    expect(publicApi.normalizeSourcePath).toBeTypeOf('function');
  });
});
