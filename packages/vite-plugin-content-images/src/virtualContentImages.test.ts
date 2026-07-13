import { describe, expect, it } from 'vitest';
import {
  createContentImagesVirtualModule,
  isPathInside,
  parseContentImageWidths,
  resolveContentImageSource,
  resolveContentImagesVirtualModuleId,
} from './virtualContentImages.ts';

describe('virtual content images', () => {
  it('parses, normalizes, and validates requested widths', () => {
    expect(
      parseContentImageWidths('virtual:content-images?widths=352;160;352;176'),
    ).toEqual([160, 176, 352]);
    expect(parseContentImageWidths('virtual:content-images')).toBeNull();
    expect(resolveContentImagesVirtualModuleId('virtual:content-images')).toBe(
      null,
    );
    expect(() =>
      parseContentImageWidths('virtual:content-images?format=avif'),
    ).toThrow('requires a widths query');
    expect(() =>
      parseContentImageWidths('virtual:content-images?widths=160;fluid'),
    ).toThrow('widths must be positive integers');
    expect(
      resolveContentImagesVirtualModuleId(
        'virtual:content-images?widths=352;160;352',
      ),
    ).toBe('\0virtual:content-images?widths=160;352');
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
      widths: [160, 320],
    });

    expect(code).toContain('virtual:content-image-source?');
    expect(code).toContain('format=avif');
    expect(code).toContain('format=webp');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('src=example.jpg');
    expect(code).toContain('export default contentImageManifest');
  });

  it('resolves generated source imports to image file ids', () => {
    expect(
      resolveContentImageSource(
        'virtual:content-image-source?src=image.jpg&w=160&format=webp',
        '/content',
      ),
    ).toBe('/content/image.jpg?w=160&format=webp');
  });

  it('rejects generated source paths outside the content directory', () => {
    expect(() =>
      resolveContentImageSource(
        'virtual:content-image-source?src=..%2Fsecret.jpg&w=160',
        '/content/media',
      ),
    ).toThrow('must stay inside the content image directory');
    expect(isPathInside('/content/media', '/content/media/image.jpg')).toBe(
      true,
    );
    expect(isPathInside('/content/media', '/content/secret.jpg')).toBe(false);
    expect(() =>
      resolveContentImageSource(
        'virtual:content-image-source?src=notes.txt&w=160',
        '/content/media',
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
        widths: [320],
      }),
    ).toThrow('must start with /media/');
  });
});
