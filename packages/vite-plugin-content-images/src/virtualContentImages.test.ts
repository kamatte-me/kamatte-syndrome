import { describe, expect, it } from 'vitest';
import {
  createContentImagesVirtualModule,
  isPathInside,
  parseContentImagesVirtualModuleRequest,
  resolveContentImageSource,
  resolveContentImagesVirtualModuleId,
} from './virtualContentImages.ts';

describe('virtual content images', () => {
  it('parses, normalizes, and validates requested widths', () => {
    expect(
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?source=content&widths=352;160;352;176',
      ),
    ).toEqual({ sourceId: 'content', widths: [160, 176, 352] });
    expect(
      parseContentImagesVirtualModuleRequest('virtual:content-images'),
    ).toBeNull();
    expect(resolveContentImagesVirtualModuleId('virtual:content-images')).toBe(
      null,
    );
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?widths=320',
      ),
    ).toThrow('requires a source query');
    expect(() =>
      parseContentImagesVirtualModuleRequest(
        'virtual:content-images?source=content&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(
      resolveContentImagesVirtualModuleId(
        'virtual:content-images?widths=352;160;352&source=content',
      ),
    ).toBe('\0virtual:content-images?source=content&widths=160;352');
  });

  it('generates static vite-imagetools imports and a manifest export', () => {
    const code = createContentImagesVirtualModule({
      manifest: {
        '/media/example.jpg': {
          avif: [],
          height: 600,
          src: '/media/example.jpg',
          webp: [],
          width: 800,
        },
      },
      publicPath: '/media',
      sourceId: 'content',
      widths: [160, 320],
    });

    expect(code).toContain('virtual:content-image-source?');
    expect(code).toContain('format=avif');
    expect(code).toContain('format=webp');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('src=example.jpg');
    expect(code).toContain('source=content');
    expect(code).toContain('export default contentImageManifest');
  });

  it('resolves generated source imports to image file ids', () => {
    const sourceDirectories = new Map([['content', '/content']]);

    expect(
      resolveContentImageSource(
        'virtual:content-image-source?source=content&src=image.jpg&w=160&format=webp',
        sourceDirectories,
      ),
    ).toBe('/content/image.jpg?w=160&format=webp');
    expect(
      resolveContentImageSource(
        'virtual:content-image-source',
        sourceDirectories,
      ),
    ).toBeNull();
    expect(() =>
      resolveContentImageSource(
        'virtual:content-image-source?source=unknown&src=image.jpg&w=160',
        sourceDirectories,
      ),
    ).toThrow('Unknown content image source: unknown');
  });

  it('rejects generated source paths outside the configured directory', () => {
    expect(() =>
      resolveContentImageSource(
        'virtual:content-image-source?source=content&src=..%2Fsecret.jpg&w=160',
        new Map([['content', '/content/media']]),
      ),
    ).toThrow('must stay inside its source directory');
    expect(isPathInside('/content/media', '/content/media/image.jpg')).toBe(
      true,
    );
    expect(isPathInside('/content/media', '/content/secret.jpg')).toBe(false);
    expect(() =>
      resolveContentImageSource(
        'virtual:content-image-source?source=content&src=notes.txt&w=160',
        new Map([['content', '/content/media']]),
      ),
    ).toThrow('must be a supported static image');
  });

  it('rejects manifest URLs outside the configured public path', () => {
    expect(() =>
      createContentImagesVirtualModule({
        manifest: {
          '/other/example.jpg': {
            avif: [],
            height: 600,
            src: '/other/example.jpg',
            webp: [],
            width: 800,
          },
        },
        publicPath: '/media',
        sourceId: 'content',
        widths: [320],
      }),
    ).toThrow('must start with /media/');
  });
});
