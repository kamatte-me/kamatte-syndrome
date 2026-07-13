import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { contentImages } from './index.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('contentImages', () => {
  it('shares the original-image sync across build environments', () => {
    const [plugin] = contentImages({
      cacheDirectory: '/cache',
      enabled: false,
      sources: [
        {
          id: 'content',
          outputDirectory: '/public/media',
          publicPath: '/media',
          sourceDirectory: '/content/media',
        },
      ],
    });

    expect(plugin?.sharedDuringBuild).toBe(true);
  });

  it('builds the widths requested by a virtual module import', async () => {
    const rootDirectory = await mkdtemp(
      path.join(tmpdir(), 'content-images-vite-'),
    );
    temporaryDirectories.push(rootDirectory);
    const contentSourceDirectory = path.join(rootDirectory, 'content-media');
    const assetSourceDirectory = path.join(rootDirectory, 'src/assets/images');
    const publicDirectory = path.join(rootDirectory, 'public');
    const outputDirectory = path.join(rootDirectory, 'dist');
    await mkdir(contentSourceDirectory, { recursive: true });
    await mkdir(assetSourceDirectory, { recursive: true });
    await sharp({
      create: {
        background: { b: 180, g: 120, r: 60 },
        channels: 3,
        height: 300,
        width: 400,
      },
    })
      .jpeg()
      .toFile(path.join(contentSourceDirectory, 'photo.jpg'));
    await sharp({
      create: {
        background: { b: 60, g: 120, r: 180 },
        channels: 3,
        height: 80,
        width: 100,
      },
    })
      .jpeg()
      .toFile(path.join(assetSourceDirectory, 'hoge.jpg'));
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import contentImages from 'virtual:content-images?source=content&widths=160;320';",
        "import assetImages from 'virtual:content-images?source=assets&widths=24;48';",
        'console.log(contentImages, assetImages);',
        '',
      ].join('\n'),
    );

    await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: { input: path.join(rootDirectory, 'main.js') },
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        contentImages({
          cacheDirectory: path.join(rootDirectory, 'cache'),
          sources: [
            {
              id: 'content',
              outputDirectory: path.join(publicDirectory, 'media'),
              publicPath: '/media',
              sourceDirectory: contentSourceDirectory,
            },
            {
              id: 'assets',
              outputDirectory: path.join(publicDirectory, 'app-images'),
              publicPath: '/app-images',
              sourceDirectory: assetSourceDirectory,
            },
          ],
        }),
      ],
      publicDir: publicDirectory,
      root: rootDirectory,
    });

    const assetDirectory = path.join(outputDirectory, 'assets');
    const assetFiles = await readdir(assetDirectory);
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.avif',
      [24, 48, 160, 320],
    );
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.webp',
      [24, 48, 160, 320],
    );

    const bundleFile = assetFiles.find((file) => file.endsWith('.js'));
    expect(bundleFile).toBeDefined();
    const bundle = await readFile(
      path.join(assetDirectory, bundleFile ?? ''),
      'utf8',
    );
    expect(bundle).toContain('/media/photo.jpg');
    expect(bundle).toContain('/app-images/hoge.jpg');
    expect(bundle).toContain('width:24');
    expect(bundle).toContain('width:48');
    expect(bundle).toContain('width:160');
    expect(bundle).toContain('width:320');

    const originalMetadata = await sharp(
      path.join(outputDirectory, 'media/photo.jpg'),
    ).metadata();
    expect(originalMetadata).toMatchObject({ height: 300, width: 400 });

    const assetMetadata = await sharp(
      path.join(outputDirectory, 'app-images/hoge.jpg'),
    ).metadata();
    expect(assetMetadata).toMatchObject({ height: 80, width: 100 });
  });

  it('rejects source configurations that could overwrite each other', () => {
    const contentSource = {
      id: 'content',
      outputDirectory: '/public/media',
      publicPath: '/media',
      sourceDirectory: '/content/media',
    };

    expect(() =>
      contentImages({ cacheDirectory: '/cache', sources: [] }),
    ).toThrow('requires at least one source');
    expect(() =>
      contentImages({
        cacheDirectory: '/cache',
        sources: [contentSource, { ...contentSource }],
      }),
    ).toThrow('Duplicate content image source id');
    expect(() =>
      contentImages({
        cacheDirectory: '/cache',
        sources: [
          contentSource,
          {
            id: 'assets',
            outputDirectory: '/public/media/assets',
            publicPath: '/assets',
            sourceDirectory: '/app/src/assets',
          },
        ],
      }),
    ).toThrow('Output directories must not overlap');
  });
});

async function expectVariantWidths(
  directory: string,
  files: string[],
  extension: '.avif' | '.webp',
  expectedWidths: number[],
) {
  const variantFiles = files.filter((file) => file.endsWith(extension));
  const widths = await Promise.all(
    variantFiles.map(async (file) => {
      const metadata = await sharp(path.join(directory, file)).metadata();
      return metadata.width;
    }),
  );

  expect(widths.sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual(expectedWidths);
}
