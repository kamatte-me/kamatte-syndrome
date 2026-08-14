import { describe, expect, it } from 'vitest';
import {
  createEmptyReactImageCollectionVirtualModule,
  createReactImageCollectionVirtualModule,
  isPathInside,
  parseReactImageCollectionVirtualModuleRequest,
  resolveManifestSourcePath,
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
        'virtual:react-optimized-responsive-image/collection?widths=original;160;original&base=/media&src=/content/media',
      ),
    ).toEqual({
      base: '/media',
      src: '/content/media',
      widths: [160, 'original'],
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

  it('generates a component bound to direct responsive asset URLs', () => {
    const code = createReactImageCollectionVirtualModule({
      manifest: {
        '/media/nested/example.jpg': {
          avif: [{ src: '/assets/example.160x120.a1b2c3d4.avif', width: 160 }],
          height: 600,
          src: '/assets/example.12345678.jpg',
          webp: [{ src: '/assets/example.160x120.e5f6a7b8.webp', width: 160 }],
          width: 800,
        },
      },
    });

    expect(code).toContain(
      'import { createReactImageCollection } from "@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react";',
    );
    expect(code).toContain('/assets/example.12345678.jpg');
    expect(code).toContain('/assets/example.160x120.a1b2c3d4.avif');
    expect(code).not.toContain('?url');
    expect(code).not.toContain('__imageVariants');
    expect(code).toContain(
      'const ReactImageCollection=createReactImageCollection(imageVariantManifest);',
    );
    expect(code).toContain('export { imageVariantManifest as manifest };');
    expect(code).toContain('export default ReactImageCollection;');

    const emptyCode = createEmptyReactImageCollectionVirtualModule();
    expect(emptyCode).toContain('const imageVariantManifest={}');
    expect(emptyCode).toContain('export { imageVariantManifest as manifest };');
    expect(emptyCode).toContain('export default ReactImageCollection;');
  });

  it('resolves manifest source paths inside the requested base only', () => {
    expect(
      resolveManifestSourcePath({
        publicPathPrefix: '/media/',
        publicUrl: '/media/nested/example.jpg',
        sourceDirectory: '/content',
      }),
    ).toBe('/content/nested/example.jpg');
    expect(() =>
      resolveManifestSourcePath({
        publicPathPrefix: '/media/',
        publicUrl: '/other/example.jpg',
        sourceDirectory: '/content',
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
