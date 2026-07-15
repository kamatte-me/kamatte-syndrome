import { describe, expect, it } from 'vitest';
import {
  createEmptyReactImageCollectionVirtualModule,
  createReactImageCollectionVirtualModule,
  isPathInside,
  parseReactImageCollectionVirtualModuleRequest,
  resolveReactImageCollectionSourceDirectory,
  resolveReactImageCollectionVirtualModule,
} from './reactImageCollection.ts';

describe('virtual React image collection', () => {
  it('parses, normalizes, and validates a collection request', () => {
    expect(
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?widths=352;160;352;176&base=media/&src=/content/media',
      ),
    ).toEqual({
      base: '/media',
      src: '/content/media',
      widths: [160, 176, 352],
    });
    expect(
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection',
      ),
    ).toBeNull();
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?base=/media&widths=320',
      ),
    ).toThrow('requires a src query');
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=/content/media&widths=320',
      ),
    ).toThrow('requires a base query');
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=/content/media&base=/media&widths=160;fluid',
      ),
    ).toThrow('widths must be positive integers');
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=%2Fcontent%3Fmedia&base=/media&widths=160',
      ),
    ).toThrow('src must not contain ? or #');
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=/content/media&base=%2Fmedia%23images&widths=160',
      ),
    ).toThrow('base must not contain ? or #');
    expect(() =>
      parseReactImageCollectionVirtualModuleRequest(
        'virtual:react-optimized-responsive-image/collection?src=/content/media&base=/media&width=160&widths=320',
      ),
    ).toThrow('does not support the width query parameter');
  });

  it('resolves Vite-root-absolute and importer-relative directories', () => {
    expect(
      resolveReactImageCollectionSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/content/media',
      }),
    ).toBe('/app/content/media');
    expect(
      resolveReactImageCollectionSourceDirectory({
        importer: '/app/src/component.tsx?import',
        rootDirectory: '/app',
        src: '../content/media',
      }),
    ).toBe('/app/content/media');
    expect(() =>
      resolveReactImageCollectionSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '@content/media',
      }),
    ).toThrow('must be Vite-root-absolute or importer-relative');
    expect(() =>
      resolveReactImageCollectionSourceDirectory({
        importer: '/app/src/component.tsx',
        rootDirectory: '/app',
        src: '/../outside',
      }),
    ).toThrow('root-absolute src must stay inside the Vite root');
  });

  it('canonicalizes resolved modules by source, base, and widths', () => {
    const first = resolveReactImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [160, 320],
    });
    const equivalent = resolveReactImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '../content/media',
      widths: [160, 320],
    });
    const differentWidths = resolveReactImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      widths: [320],
    });
    const realWatchDirectory = resolveReactImageCollectionVirtualModule({
      base: '/media',
      sourceDirectory: '/app/content/media',
      src: '/content/media',
      watchDirectory: '/real/content/media',
      widths: [160, 320],
    });

    expect(first.id).toMatch(
      /^\0virtual:react-optimized-responsive-image\/collection:resolved:[a-f0-9]{64}$/,
    );
    expect(first.id).toBe(equivalent.id);
    expect(first.id).not.toBe(differentWidths.id);
    expect(realWatchDirectory.id).toBe(first.id);
    expect(realWatchDirectory.watchDirectory).toBe('/real/content/media');
  });

  it('generates responsive assets and a component bound to the manifest', () => {
    const code = createReactImageCollectionVirtualModule({
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
      'import { createReactImageCollection } from "@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react";',
    );
    expect(code).toContain(
      'import imageVariantOriginal0 from "/content/nested/example.jpg";',
    );
    expect(code).toContain('/content/nested/example.jpg?');
    expect(code).toContain('__imageVariants=true');
    expect(code).toContain('format=avif');
    expect(code).toContain('quality=60');
    expect(code).toContain('format=webp');
    expect(code).toContain('quality=80');
    expect(code).toContain('w=160%3B320');
    expect(code).toContain('src:imageVariantOriginal0');
    expect(code).not.toContain('src:"/media/nested/example.jpg"');
    expect(code).toContain(
      'const ReactImageCollection=createReactImageCollection(imageVariantManifest);',
    );
    expect(code).not.toContain('export { imageVariantManifest as manifest };');
    expect(code).toContain('export default ReactImageCollection;');

    const emptyCode = createEmptyReactImageCollectionVirtualModule();
    expect(emptyCode).toContain('const imageVariantManifest={}');
    expect(emptyCode).toContain('export default ReactImageCollection;');
  });

  it('rejects manifest URLs outside the requested base', () => {
    expect(() =>
      createReactImageCollectionVirtualModule({
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
