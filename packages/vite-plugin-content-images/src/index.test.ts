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
      outputDirectory: '/public/media',
      publicPath: '/media',
      sourceDirectory: '/content/media',
    });

    expect(plugin?.sharedDuringBuild).toBe(true);
  });

  it('builds the widths requested by a virtual module import', async () => {
    const rootDirectory = await mkdtemp(
      path.join(tmpdir(), 'content-images-vite-'),
    );
    temporaryDirectories.push(rootDirectory);
    const sourceDirectory = path.join(rootDirectory, 'content-media');
    const publicDirectory = path.join(rootDirectory, 'public');
    const outputDirectory = path.join(rootDirectory, 'dist');
    await mkdir(sourceDirectory, { recursive: true });
    await sharp({
      create: {
        background: { b: 180, g: 120, r: 60 },
        channels: 3,
        height: 300,
        width: 400,
      },
    })
      .jpeg()
      .toFile(path.join(sourceDirectory, 'photo.jpg'));
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      "import images from 'virtual:content-images?widths=160;320';\nconsole.log(images);\n",
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
          outputDirectory: path.join(publicDirectory, 'media'),
          publicPath: '/media',
          sourceDirectory,
        }),
      ],
      publicDir: publicDirectory,
      root: rootDirectory,
    });

    const assetDirectory = path.join(outputDirectory, 'assets');
    const assetFiles = await readdir(assetDirectory);
    await expectVariantWidths(assetDirectory, assetFiles, '.avif', [160, 320]);
    await expectVariantWidths(assetDirectory, assetFiles, '.webp', [160, 320]);

    const bundleFile = assetFiles.find((file) => file.endsWith('.js'));
    expect(bundleFile).toBeDefined();
    const bundle = await readFile(
      path.join(assetDirectory, bundleFile ?? ''),
      'utf8',
    );
    expect(bundle).toContain('/media/photo.jpg');
    expect(bundle).toContain('width:160');
    expect(bundle).toContain('width:320');

    const originalMetadata = await sharp(
      path.join(outputDirectory, 'media/photo.jpg'),
    ).metadata();
    expect(originalMetadata).toMatchObject({ height: 300, width: 400 });
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
