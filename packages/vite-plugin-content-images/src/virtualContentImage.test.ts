import { describe, expect, it } from 'vitest';
import {
  createContentImageVirtualModule,
  createUnoptimizedContentImageVirtualModule,
  parseContentImageVirtualModuleRequest,
  resolveContentImageVirtualModule,
} from './virtualContentImage.ts';

describe('virtual content image', () => {
  it('parses, normalizes, and validates a single image request', () => {
    expect(
      parseContentImageVirtualModuleRequest(
        'virtual:content-image?src=.%2Fimage.jpg&widths=320;160;320',
      ),
    ).toEqual({ lossless: false, src: './image.jpg', widths: [160, 320] });
    expect(
      parseContentImageVirtualModuleRequest('virtual:content-image'),
    ).toBeNull();
    expect(() =>
      parseContentImageVirtualModuleRequest(
        'virtual:content-image?widths=160;320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseContentImageVirtualModuleRequest(
        'virtual:content-image?src=./image.jpg&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
  });

  it('creates a canonical id without exposing the resolved source path', () => {
    const resolved = resolveContentImageVirtualModule({
      lossless: false,
      sourcePath: '/project/src/image.jpg',
      src: './image.jpg',
      widths: [160, 320],
    });

    expect(resolved.id).toMatch(
      /^\0virtual:content-image:resolved:[a-f0-9]{64}$/,
    );
    expect(resolved.id).not.toContain('/project');
    expect(resolved.sourcePath).toBe('/project/src/image.jpg');
  });

  it('generates static fallback, AVIF, and WebP imports', () => {
    const code = createContentImageVirtualModule({
      lossless: false,
      sourcePath: '/project/src/image.jpg',
      widths: [160, 320],
    });

    expect(code).toContain('as=metadata%3Asrc%3Bwidth%3Bheight');
    expect(code).toContain('format=avif');
    expect(code).toContain('format=avif&quality=60');
    expect(code).toContain('format=webp');
    expect(code).toContain('format=webp&quality=80');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('export default contentImage');
  });

  it('generates lossless variants when requested', () => {
    const request = parseContentImageVirtualModuleRequest(
      'virtual:content-image?src=./code.png&widths=140;280&lossless=true',
    );
    expect(request).toEqual({
      lossless: true,
      src: './code.png',
      widths: [140, 280],
    });
    const code = createContentImageVirtualModule({
      lossless: true,
      sourcePath: '/project/src/code.png',
      widths: [140, 280],
    });

    expect(code).toContain('lossless=true');
    expect(code).not.toContain('quality=');
    expect(code).not.toContain('format=avif');
    expect(code).toContain('avif:[]');
  });

  it('generates an unoptimized fallback when image processing is disabled', () => {
    const code = createUnoptimizedContentImageVirtualModule({
      height: 80,
      sourcePath: '/project/src/image.jpg',
      width: 100,
    });

    expect(code).toContain(
      'import contentImageFallback from "/project/src/image.jpg"',
    );
    expect(code).toContain('avif:[]');
    expect(code).toContain('height:80');
    expect(code).toContain('width:100');
  });

  it('rejects unsupported source formats', () => {
    expect(() =>
      resolveContentImageVirtualModule({
        lossless: false,
        sourcePath: '/project/src/image.svg',
        src: './image.svg',
        widths: [160],
      }),
    ).toThrow('must be a supported static image');
  });
});
