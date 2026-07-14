import { describe, expect, it } from 'vitest';
import {
  createImageVariantsVirtualModule,
  isPathInside,
  parseImageVariantsVirtualModuleRequest,
  resolveImageVariantsSourceDirectory,
  resolveImageVariantsVirtualModule,
} from './virtualImageVariants.ts';

describe('virtual image variants', () => {
  it('parses, normalizes, and validates a self-contained request', () => {
    expect(
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?widths=352;160;352;176&base=media/&src=/content/media',
      ),
    ).toEqual({
      base: '/media',
      src: '/content/media',
      widths: [160, 176, 352],
    });
    expect(
      parseImageVariantsVirtualModuleRequest('virtual:image-variants'),
    ).toBeNull();
    expect(() =>
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?base=/media&widths=320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?src=/content/media&widths=320',
      ),
    ).toThrow('requires a base query');
    expect(() =>
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?src=/content/media&base=/media&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(() =>
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?src=%2Fcontent%3Fmedia&base=/media&widths=160',
      ),
    ).toThrow('src must not contain ? or #');
    expect(() =>
      parseImageVariantsVirtualModuleRequest(
        'virtual:image-variants?src=/content/media&base=%2Fmedia%23images&widths=160',
      ),
    ).toThrow('base must not contain ? or #');
  });

  it('resolves Vite-root-absolute and importer-relative source directories', () => {
    expect(
      resolveImageVariantsSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/content/media',
      }),
    ).toBe('/app/content/media');
    expect(
      resolveImageVariantsSourceDirectory({
        importer: '/app/src/component.tsx?import',
        rootDirectory: '/app',
        src: '../content/media',
      }),
    ).toBe('/app/content/media');
    expect(() =>
      resolveImageVariantsSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '@content/media',
      }),
    ).toThrow('must be Vite-root-absolute or importer-relative');
    expect(() =>
      resolveImageVariantsSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/../outside',
      }),
    ).toThrow('root-absolute src must stay inside the Vite root');
  });

  it('canonicalizes resolved modules by source, base, and widths', () => {
    const first = resolveImageVariantsVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [160, 320],
    });
    const equivalent = resolveImageVariantsVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '../content/media',
      widths: [160, 320],
    });
    const differentWidths = resolveImageVariantsVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [320],
    });
    const realWatchDirectory = resolveImageVariantsVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      watchDirectory: '/real/content/media',
      widths: [160, 320],
    });

    expect(first.id).toBe(equivalent.id);
    expect(first.id).not.toBe(differentWidths.id);
    expect(realWatchDirectory.id).toBe(first.id);
    expect(realWatchDirectory.watchDirectory).toBe('/real/content/media');
  });

  it('generates original and responsive asset imports with a manifest export', () => {
    const code = createImageVariantsVirtualModule({
      base: '/media',
      manifest: {
        '/media/nested/example.jpg': {
          avif: [],
          height: 600,
          src: '/media/nested/example.jpg',
          webp: [],
          width: 800,
        },
      },
      sourceDirectory: '/content',
      widths: [160, 320],
    });

    expect(code).toContain(
      'import imageVariantOriginal0 from "/content/nested/example.jpg";',
    );
    expect(code).toContain('/content/nested/example.jpg?');
    expect(code).toContain('format=avif');
    expect(code).toContain('quality=60');
    expect(code).toContain('format=webp');
    expect(code).toContain('quality=80');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('src:imageVariantOriginal0');
    expect(code).not.toContain('src:"/media/nested/example.jpg"');
    expect(code).not.toContain('virtual:image-variant-source');
    expect(code).toContain('export default imageVariantManifest');
  });

  it('rejects manifest URLs outside the requested base', () => {
    expect(() =>
      createImageVariantsVirtualModule({
        base: '/media',
        manifest: {
          '/other/example.jpg': {
            avif: [],
            height: 600,
            src: '/other/example.jpg',
            webp: [],
            width: 800,
          },
        },
        sourceDirectory: '/content',
        widths: [320],
      }),
    ).toThrow('must start with /media/');
  });

  it('recognizes paths within a source directory', () => {
    expect(isPathInside('/content/media', '/content/media/image.jpg')).toBe(
      true,
    );
    expect(isPathInside('/content/media', '/content/secret.jpg')).toBe(false);
  });
});
