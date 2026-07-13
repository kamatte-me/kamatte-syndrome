import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import { generateContentImages } from './generateContentImages.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('generateContentImages', () => {
  it('creates a sanitized full-size image and records its dimensions', async () => {
    const directories = await createDirectories();
    const sourcePath = path.join(directories.sourceDirectory, 'photo.jpg');
    const pixels = createNoisePixels(1200, 800);

    await sharp(pixels, { raw: { channels: 3, height: 800, width: 1200 } })
      .jpeg({ quality: 98 })
      .withMetadata({ orientation: 6 })
      .toFile(sourcePath);

    const manifest = await generateContentImages({
      ...directories,
      publicPath: '/media',
    });
    const entry = manifest['/media/photo.jpg'];

    expect(entry).toBeDefined();
    expect(entry).toMatchObject({
      height: 1200,
      src: '/media/photo.jpg',
      width: 800,
    });
    expect(entry?.avif).toEqual([]);
    expect(entry?.webp).toEqual([]);

    const fallbackMetadata = await sharp(
      path.join(directories.outputDirectory, 'photo.jpg'),
    ).metadata();
    expect(fallbackMetadata).toMatchObject({ height: 1200, width: 800 });
    expect(fallbackMetadata.exif).toBeUndefined();
    expect(fallbackMetadata.orientation).toBeUndefined();
  });

  it('preserves PNG transparency in the full-size public image', async () => {
    const directories = await createDirectories();
    const sourcePath = path.join(directories.sourceDirectory, 'alpha.png');

    await sharp({
      create: {
        background: { alpha: 0.5, b: 255, g: 0, r: 0 },
        channels: 4,
        height: 80,
        width: 100,
      },
    })
      .png()
      .toFile(sourcePath);

    const manifest = await generateContentImages({
      ...directories,
      publicPath: '/media',
    });
    const metadata = await sharp(
      path.join(directories.outputDirectory, 'alpha.png'),
    ).metadata();

    expect(manifest['/media/alpha.png']).toMatchObject({
      height: 80,
      width: 100,
    });
    expect(metadata.hasAlpha).toBe(true);
  });

  it('keeps animated GIF files out of the image manifest', async () => {
    const directories = await createDirectories();
    const sourcePath = path.join(directories.sourceDirectory, 'animated.gif');
    await writeFile(sourcePath, createAnimatedGif());

    const manifest = await generateContentImages({
      ...directories,
      publicPath: '/media',
    });
    const metadata = await sharp(
      path.join(directories.outputDirectory, 'animated.gif'),
      { animated: true },
    ).metadata();

    expect(manifest['/media/animated.gif']).toBeUndefined();
    expect(metadata.pages).toBe(2);
  });

  it('removes stale public files when sources are deleted', async () => {
    const directories = await createDirectories();
    const sourcePath = path.join(directories.sourceDirectory, 'change.jpg');
    const firstPixels = createNoisePixels(800, 600, 0);
    await sharp(firstPixels, { raw: { channels: 3, height: 600, width: 800 } })
      .jpeg({ quality: 98 })
      .toFile(sourcePath);
    await generateContentImages({
      ...directories,
      publicPath: '/media',
    });
    await rm(sourcePath);
    const secondManifest = await generateContentImages({
      ...directories,
      publicPath: '/media',
    });

    expect(secondManifest['/media/change.jpg']).toBeUndefined();
    await expect(
      readFile(path.join(directories.outputDirectory, 'change.jpg')),
    ).rejects.toThrow();
  });

  it('invalidates cached manifest URLs when the public path changes', async () => {
    const directories = await createDirectories();
    await sharp({
      create: {
        background: 'blue',
        channels: 3,
        height: 80,
        width: 100,
      },
    })
      .jpeg()
      .toFile(path.join(directories.sourceDirectory, 'cached.jpg'));

    await generateContentImages({
      ...directories,
      publicPath: '/media',
    });
    const manifest = await generateContentImages({
      ...directories,
      publicPath: '/assets',
    });

    expect(manifest['/media/cached.jpg']).toBeUndefined();
    expect(manifest['/assets/cached.jpg']?.src).toBe('/assets/cached.jpg');
  });

  it('reports the relative path of corrupt supported images', async () => {
    const directories = await createDirectories();
    await writeFile(
      path.join(directories.sourceDirectory, 'broken.jpg'),
      'not an image',
    );

    await expect(
      generateContentImages({ ...directories, publicPath: '/media' }),
    ).rejects.toThrow('Failed to process content image: broken.jpg');
  });
});

async function createDirectories() {
  const rootDirectory = await mkdtemp(path.join(tmpdir(), 'content-images-'));
  temporaryDirectories.push(rootDirectory);
  const sourceDirectory = path.join(rootDirectory, 'source');
  const outputDirectory = path.join(rootDirectory, 'output');
  const cacheDirectory = path.join(rootDirectory, 'cache');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(sourceDirectory, { recursive: true });
  return { cacheDirectory, outputDirectory, sourceDirectory };
}

function createNoisePixels(width: number, height: number, offset = 0) {
  const pixels = Buffer.alloc(width * height * 3);
  for (let index = 0; index < pixels.length; index += 1) {
    pixels[index] = (index * 31 + offset * 17 + Math.floor(index / 97)) % 256;
  }
  return pixels;
}

function createAnimatedGif() {
  return Buffer.from(
    '47494638396101000100800000000000ffffff21f904000a0000002c000000000100010000020244010021f904000a0000002c00000000010001000002024c01003b',
    'hex',
  );
}
