import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { scanImageVariantManifest } from './metadata.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('scanImageVariantManifest', () => {
  it('recursively scans supported images with auto-oriented dimensions', async () => {
    const sourceDirectory = await createSourceDirectory();
    const nestedDirectory = path.join(sourceDirectory, 'nested');
    await mkdir(nestedDirectory);

    await sharp({
      create: {
        background: 'red',
        channels: 3,
        height: 80,
        width: 120,
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(path.join(nestedDirectory, 'oriented.JPG'));
    await sharp({
      create: {
        background: { alpha: 0.5, b: 255, g: 0, r: 0 },
        channels: 4,
        height: 40,
        width: 60,
      },
    })
      .png()
      .toFile(path.join(sourceDirectory, 'alpha.png'));

    const filesBeforeScan = await listRelativeFiles(sourceDirectory);
    const manifest = await scanImageVariantManifest({
      publicPath: '/media/',
      sourceDirectory,
    });

    expect(manifest).toEqual({
      '/media/alpha.png': {
        avif: [],
        height: 40,
        src: '/media/alpha.png',
        webp: [],
        width: 60,
      },
      '/media/nested/oriented.JPG': {
        avif: [],
        height: 120,
        src: '/media/nested/oriented.JPG',
        webp: [],
        width: 80,
      },
    });
    await expect(listRelativeFiles(sourceDirectory)).resolves.toEqual(
      filesBeforeScan,
    );
  });

  it('ignores GIF, SVG, and unknown files', async () => {
    const sourceDirectory = await createSourceDirectory();
    await Promise.all([
      writeFile(path.join(sourceDirectory, 'animated.gif'), 'not inspected'),
      writeFile(path.join(sourceDirectory, 'icon.svg'), '<svg />'),
      writeFile(path.join(sourceDirectory, 'notes.txt'), 'notes'),
    ]);

    await expect(
      scanImageVariantManifest({ publicPath: '/', sourceDirectory }),
    ).resolves.toEqual({});
  });

  it('includes each supported static image format', async () => {
    const sourceDirectory = await createSourceDirectory();
    const image = {
      create: {
        background: 'blue',
        channels: 3 as const,
        height: 20,
        width: 30,
      },
    };
    await Promise.all([
      sharp(image).avif().toFile(path.join(sourceDirectory, 'image.avif')),
      sharp(image).jpeg().toFile(path.join(sourceDirectory, 'image.jpeg')),
      sharp(image).png().toFile(path.join(sourceDirectory, 'image.png')),
      sharp(image).webp().toFile(path.join(sourceDirectory, 'image.webp')),
    ]);

    const manifest = await scanImageVariantManifest({
      publicPath: '/assets',
      sourceDirectory,
    });

    expect(Object.keys(manifest)).toEqual([
      '/assets/image.avif',
      '/assets/image.jpeg',
      '/assets/image.png',
      '/assets/image.webp',
    ]);
    expect(
      Object.values(manifest).every(
        ({ height, width }) => height === 20 && width === 30,
      ),
    ).toBe(true);
  });

  it('reports the relative path of a corrupt supported image', async () => {
    const sourceDirectory = await createSourceDirectory();
    const nestedDirectory = path.join(sourceDirectory, 'nested');
    await mkdir(nestedDirectory);
    await writeFile(path.join(nestedDirectory, 'broken.webp'), 'not an image');

    await expect(
      scanImageVariantManifest({
        publicPath: '/media',
        sourceDirectory,
      }),
    ).rejects.toThrow('Failed to read image metadata: nested/broken.webp');
  });

  it('rejects image names that cannot be represented as stable URLs', async () => {
    for (const fileName of ['question?.png', 'fragment#name.png']) {
      const sourceDirectory = await createSourceDirectory();
      await sharp({
        create: {
          background: 'green',
          channels: 3,
          height: 20,
          width: 30,
        },
      })
        .png()
        .toFile(path.join(sourceDirectory, fileName));

      await expect(
        scanImageVariantManifest({
          publicPath: '/media',
          sourceDirectory,
        }),
      ).rejects.toThrow(
        `Image source path must not contain ? or #: ${fileName}`,
      );
    }
  });
});

async function createSourceDirectory() {
  const sourceDirectory = await mkdtemp(
    path.join(tmpdir(), 'image-variant-manifest-'),
  );
  temporaryDirectories.push(sourceDirectory);
  return sourceDirectory;
}

async function listRelativeFiles(directory: string, relativeDirectory = '') {
  const currentDirectory = path.join(directory, relativeDirectory);
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRelativeFiles(directory, relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath.split(path.sep).join('/'));
    }
  }

  return files.sort();
}
