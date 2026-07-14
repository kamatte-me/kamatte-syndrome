import { describe, expect, it } from 'vitest';
import {
  createImageVariantVirtualModule,
  createUnoptimizedImageVariantVirtualModule,
  parseImageVariantVirtualModuleRequest,
  resolveImageVariantVirtualModule,
} from './virtualImageVariant.ts';

describe('virtual image variant', () => {
  it('parses, normalizes, and validates a single image request', () => {
    expect(
      parseImageVariantVirtualModuleRequest(
        'virtual:image-variant?src=.%2Fimage.jpg&widths=320;160;320',
      ),
    ).toEqual({ lossless: false, src: './image.jpg', widths: [160, 320] });
    expect(
      parseImageVariantVirtualModuleRequest('virtual:image-variant'),
    ).toBeNull();
    expect(() =>
      parseImageVariantVirtualModuleRequest(
        'virtual:image-variant?widths=160;320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseImageVariantVirtualModuleRequest(
        'virtual:image-variant?src=./image.jpg&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(() =>
      parseImageVariantVirtualModuleRequest(
        'virtual:image-variant?src=.%2Fimage%3Fname.jpg&widths=160',
      ),
    ).toThrow('src must not contain ? or #');
    expect(() =>
      parseImageVariantVirtualModuleRequest(
        'virtual:image-variant?src=./image.jpg&widths=160&lossles=true',
      ),
    ).toThrow('does not support the lossles query parameter');
  });

  it('creates a canonical id without exposing the resolved source path', () => {
    const resolved = resolveImageVariantVirtualModule({
      lossless: false,
      sourcePath: '/project/src/image.jpg',
      src: './image.jpg',
      widths: [160, 320],
    });

    expect(resolved.id).toMatch(
      /^\0virtual:image-variant:resolved:[a-f0-9]{64}$/,
    );
    expect(resolved.id).not.toContain('/project');
    expect(resolved.sourcePath).toBe('/project/src/image.jpg');
  });

  it('generates static fallback, AVIF, and WebP imports', () => {
    const code = createImageVariantVirtualModule({
      lossless: false,
      naturalHeight: 180,
      naturalWidth: 240,
      sourcePath: '/project/src/image.jpg',
      widths: [160, 320],
    });

    expect(code).toContain(
      'import imageVariantFallback from "/project/src/image.jpg"',
    );
    expect(code).toContain('__imageVariants=true');
    expect(code).toContain('format=avif');
    expect(code).toContain('format=avif&quality=60');
    expect(code).toContain('format=webp');
    expect(code).toContain('format=webp&quality=80');
    expect(code).toContain('allowUpscale=true');
    expect(code).toContain('w=160%3B240');
    expect(code).toContain('height:180');
    expect(code).toContain('width:240');
    expect(code).toContain('export default imageVariant');
  });

  it('generates lossless variants when requested', () => {
    const request = parseImageVariantVirtualModuleRequest(
      'virtual:image-variant?src=./code.png&widths=140;280&lossless=true',
    );
    expect(request).toEqual({
      lossless: true,
      src: './code.png',
      widths: [140, 280],
    });
    const code = createImageVariantVirtualModule({
      lossless: true,
      naturalHeight: 200,
      naturalWidth: 200,
      sourcePath: '/project/src/code.png',
      widths: [140, 280],
    });

    expect(code).toContain('lossless=true');
    expect(code).not.toContain('quality=');
    expect(code).not.toContain('format=avif');
    expect(code).toContain('avif:[]');
  });

  it('generates an unoptimized fallback when image processing is disabled', () => {
    const code = createUnoptimizedImageVariantVirtualModule({
      height: 80,
      sourcePath: '/project/src/image.jpg',
      width: 100,
    });

    expect(code).toContain(
      'import imageVariantFallback from "/project/src/image.jpg"',
    );
    expect(code).toContain('avif:[]');
    expect(code).toContain('height:80');
    expect(code).toContain('width:100');
  });

  it('rejects unsupported source formats', () => {
    expect(() =>
      resolveImageVariantVirtualModule({
        lossless: false,
        sourcePath: '/project/src/image.svg',
        src: './image.svg',
        widths: [160],
      }),
    ).toThrow('must be a supported static image');
  });
});
