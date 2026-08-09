import { describe, expect, it } from 'vitest';
import { imageSourceExtensions } from '../image/formats.ts';
import {
  createReactImageVirtualModule,
  createUnoptimizedReactImageVirtualModule,
  parseReactImageVirtualModuleRequest,
  resolveReactImageVirtualModule,
} from './reactImage.ts';

describe('virtual React image', () => {
  it('parses, normalizes, and validates a single image request', () => {
    expect(
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?src=.%2Fimage.jpg&widths=320;160;320',
      ),
    ).toEqual({ lossless: false, src: './image.jpg', widths: [160, 320] });
    expect(
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?src=.%2Fimage.jpg&widths=original;160;original',
      ),
    ).toEqual({
      lossless: false,
      src: './image.jpg',
      widths: [160, 'original'],
    });
    expect(
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image',
      ),
    ).toBeNull();
    expect(
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=./images&base=/media&widths=160',
      ),
    ).toBeNull();
    expect(() =>
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?widths=160;320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?src=./image.jpg&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(() =>
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?src=.%2Fimage%3Fname.jpg&widths=160',
      ),
    ).toThrow('src must not contain ? or #');
    expect(() =>
      parseReactImageVirtualModuleRequest(
        'virtual:react-optimized-responsive-image?src=./image.jpg&widths=160&lossles=true',
      ),
    ).toThrow('does not support the lossles query parameter');
  });

  it('creates a canonical id without exposing the resolved source path', () => {
    const resolved = resolveReactImageVirtualModule({
      lossless: false,
      sourcePath: '/project/src/image.jpg',
      src: './image.jpg',
      widths: [160, 320],
    });

    expect(resolved.id).toMatch(
      /^\0virtual:react-optimized-responsive-image:resolved:[a-f0-9]{64}$/,
    );
    expect(resolved.id).not.toContain('/project');
    expect(resolved.sourcePath).toBe('/project/src/image.jpg');
  });

  it('generates a React component from supplied Vite asset URLs', () => {
    const code = createReactImageVirtualModule({
      image: {
        avif: [
          { src: '/assets/image.160x120.a1b2c3d4.avif', width: 160 },
          { src: '/assets/image.240x180.e5f6a7b8.avif', width: 240 },
        ],
        height: 180,
        src: '/assets/image.12345678.jpg',
        webp: [{ src: '/assets/image.160x120.0a1b2c3d.webp', width: 160 }],
        width: 240,
      },
    });

    expect(code).toContain(
      'import { createReactImage } from "@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react";',
    );
    expect(code).toContain('/assets/image.12345678.jpg');
    expect(code).toContain('/assets/image.160x120.a1b2c3d4.avif');
    expect(code).toContain('"height":180');
    expect(code).toContain('"width":240');
    expect(code).toContain('const ReactImage=createReactImage(imageVariant);');
    expect(code).not.toContain('?url');
    expect(code).not.toContain('__imageVariants');
    expect(code).not.toContain('export { imageVariant as variant };');
    expect(code).toContain('export default ReactImage;');
  });

  it('generates only the fallback when no derived candidate is useful', () => {
    const code = createReactImageVirtualModule({
      image: {
        avif: [],
        height: 80,
        src: '/assets/image.12345678.webp',
        webp: [],
        width: 100,
      },
    });

    expect(code).toContain('/assets/image.12345678.webp');
    expect(code).not.toContain('?url');
    expect(code).not.toContain('__imageVariants');
    expect(code).toContain('"avif":[]');
    expect(code).toContain('"webp":[]');
  });

  it('generates a bound fallback component when processing is disabled', () => {
    const code = createUnoptimizedReactImageVirtualModule({
      image: {
        avif: [{ src: '/assets/unreachable.avif', width: 100 }],
        height: 80,
        src: '/assets/image.12345678.jpg',
        webp: [{ src: '/assets/unreachable.webp', width: 100 }],
        width: 100,
      },
    });

    expect(code).toContain('/assets/image.12345678.jpg');
    expect(code).toContain('"avif":[]');
    expect(code).toContain('"webp":[]');
    expect(code).toContain('const ReactImage=createReactImage(imageVariant);');
    expect(code).toContain('export default ReactImage;');
  });

  it('rejects unsupported source formats', () => {
    expect(() =>
      resolveReactImageVirtualModule({
        lossless: false,
        sourcePath: '/project/src/image.svg',
        src: './image.svg',
        widths: [160],
      }),
    ).toThrow('must be a supported image');
  });

  it('accepts every supported input extension', () => {
    for (const extension of imageSourceExtensions) {
      expect(() =>
        resolveReactImageVirtualModule({
          lossless: false,
          sourcePath: `/project/src/image${extension}`,
          src: `./image${extension}`,
          widths: [160],
        }),
      ).not.toThrow();
    }
  });
});
