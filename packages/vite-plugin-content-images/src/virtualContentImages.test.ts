import { describe, expect, it } from 'vitest';
import {
  createContentImagesVirtualModule,
  isPathInside,
  parseContentImagesVirtualModuleRequest,
  resolveContentImagesSourceDirectory,
  resolveContentImagesVirtualModule,
} from './virtualContentImages.ts';

describe('virtual content images', () => {
  it('parses, normalizes, and validates a self-contained request', () => {
    expect(
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?widths=352;160;352;176&base=media/&src=/content/media',
      ),
    ).toEqual({
      base: '/media',
      src: '/content/media',
      widths: [160, 176, 352],
    });
    expect(
      parseContentImagesVirtualModuleRequest('virtual:content-images'),
    ).toBeNull();
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?base=/media&widths=320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?src=/content/media&widths=320',
      ),
    ).toThrow('requires a base query');
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?src=/content/media&base=/media&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?src=%2Fcontent%3Fmedia&base=/media&widths=160',
      ),
    ).toThrow('src must not contain ? or #');
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?src=/content/media&base=%2Fmedia%23images&widths=160',
      ),
    ).toThrow('base must not contain ? or #');
  });

  it('resolves Vite-root-absolute and importer-relative source directories', () => {
    expect(
      resolveContentImagesSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/content/media',
      }),
    ).toBe('/app/content/media');
    expect(
      resolveContentImagesSourceDirectory({
        importer: '/app/src/component.tsx?import',
        rootDirectory: '/app',
        src: '../content/media',
      }),
    ).toBe('/app/content/media');
    expect(() =>
      resolveContentImagesSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '@content/media',
      }),
    ).toThrow('must be Vite-root-absolute or importer-relative');
    expect(() =>
      resolveContentImagesSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/../outside',
      }),
    ).toThrow('root-absolute src must stay inside the Vite root');
  });

  it('canonicalizes resolved modules by source, base, and widths', () => {
    const first = resolveContentImagesVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [160, 320],
    });
    const equivalent = resolveContentImagesVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '../content/media',
      widths: [160, 320],
    });
    const differentWidths = resolveContentImagesVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [320],
    });
    const realWatchDirectory = resolveContentImagesVirtualModule({
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
    const code = createContentImagesVirtualModule({
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
      'import contentImageOriginal0 from "/content/nested/example.jpg";',
    );
    expect(code).toContain('/content/nested/example.jpg?');
    expect(code).toContain('format=avif');
    expect(code).toContain('quality=60');
    expect(code).toContain('format=webp');
    expect(code).toContain('quality=80');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('src:contentImageOriginal0');
    expect(code).not.toContain('src:"/media/nested/example.jpg"');
    expect(code).not.toContain('virtual:content-image-source');
    expect(code).toContain('export default contentImageManifest');
  });

  it('rejects manifest URLs outside the requested base', () => {
    expect(() =>
      createContentImagesVirtualModule({
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
