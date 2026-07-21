import { describe, expect, it } from 'vitest';
import { resolveImageVariantFormatSettings } from '../image/transform.ts';
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

  it('generates a React component with fallback, AVIF, and WebP imports', () => {
    const code = createReactImageVirtualModule({
      lossless: false,
      naturalHeight: 180,
      naturalWidth: 240,
      sourcePath: '/project/src/image.jpg',
      variantWidths: { avif: [160, 240], webp: [160, 240] },
    });

    expect(code).toContain(
      'import { createReactImage } from "@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react";',
    );
    expect(code).toContain(
      'import imageVariantFallback from "/project/src/image.jpg"',
    );
    expect(code).toContain('__imageVariants=true');
    expect(code).toContain('format=avif&quality=60');
    expect(code).toContain('format=webp&quality=80');
    expect(code).toContain('allowUpscale=true');
    expect(code).toContain('w=160%3B240');
    expect(code).toContain('height:180');
    expect(code).toContain('width:240');
    expect(code).toContain('const ReactImage=createReactImage(imageVariant);');
    expect(code).not.toContain('export { imageVariant as variant };');
    expect(code).toContain('export default ReactImage;');
  });

  it('generates variants with custom compression settings', () => {
    const code = createReactImageVirtualModule({
      formatSettings: resolveImageVariantFormatSettings({
        avif: { effort: 8, quality: 55 },
        webp: { effort: 6, quality: 75 },
      }),
      lossless: false,
      naturalHeight: 180,
      naturalWidth: 240,
      sourcePath: '/project/src/image.jpg',
      variantWidths: { avif: [160], webp: [160] },
    });

    expect(code).toContain('format=avif&quality=55&effort=8');
    expect(code).toContain('format=webp&quality=75&effort=6');
  });

  it('generates lossless variants when requested', () => {
    const request = parseReactImageVirtualModuleRequest(
      'virtual:react-optimized-responsive-image?src=./code.png&widths=140;280&lossless=true',
    );
    expect(request).toEqual({
      lossless: true,
      src: './code.png',
      widths: [140, 280],
    });
    const code = createReactImageVirtualModule({
      formatSettings: resolveImageVariantFormatSettings({
        webp: { effort: 6, quality: 75 },
      }),
      lossless: true,
      naturalHeight: 200,
      naturalWidth: 200,
      sourcePath: '/project/src/code.png',
      variantWidths: { avif: [], webp: [140, 200] },
    });

    expect(code).toContain('lossless=true');
    expect(code).toContain('effort=6');
    expect(code).not.toContain('quality=');
    expect(code).not.toContain('format=avif');
    expect(code).toContain('avif:[]');
  });

  it('generates only the fallback when no derived candidate is useful', () => {
    const code = createReactImageVirtualModule({
      lossless: false,
      naturalHeight: 80,
      naturalWidth: 100,
      sourcePath: '/project/src/image.webp',
      variantWidths: { avif: [], webp: [] },
    });

    expect(code).toContain(
      'import imageVariantFallback from "/project/src/image.webp"',
    );
    expect(code).not.toContain('__imageVariants=true');
    expect(code).not.toContain('imageVariantAvif');
    expect(code).not.toContain('imageVariantWebp');
    expect(code).toContain('avif:[]');
    expect(code).toContain('webp:[]');
  });

  it('generates a bound fallback component when processing is disabled', () => {
    const code = createUnoptimizedReactImageVirtualModule({
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
});
