import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveImageVariantFormatSettings,
  selectImageVariantWidths,
} from './transform.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('selectImageVariantWidths', () => {
  it('keeps only variants that are smaller than the original file', async () => {
    const directory = await createTemporaryDirectory();
    const compressibleSource = path.join(directory, 'compressible.png');
    const compactSource = path.join(directory, 'compact.webp');
    const pixels = Buffer.alloc(160 * 160 * 3);
    for (let index = 0; index < pixels.length; index += 1) {
      pixels[index] = index % 251;
    }

    await sharp(pixels, {
      raw: { channels: 3, height: 160, width: 160 },
    })
      .png({ compressionLevel: 0 })
      .toFile(compressibleSource);
    await sharp({
      create: {
        background: 'black',
        channels: 3,
        height: 1,
        width: 1,
      },
    })
      .webp({ quality: 80 })
      .toFile(compactSource);

    await expect(
      selectImageVariantWidths({
        sourcePath: compressibleSource,
        widths: [80, 160, 320],
      }),
    ).resolves.toEqual({ avif: [80, 160], webp: [80, 160] });
    await expect(
      selectImageVariantWidths({
        sourcePath: compactSource,
        widths: [1],
      }),
    ).resolves.toEqual({ avif: [], webp: [] });
  });

  it('uses compression settings when selecting smaller variants', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = path.join(directory, 'source.webp');
    const pixels = Buffer.alloc(160 * 160 * 3);
    for (let index = 0; index < pixels.length; index += 1) {
      pixels[index] = index % 251;
    }
    await sharp(pixels, {
      raw: { channels: 3, height: 160, width: 160 },
    })
      .webp({ quality: 50 })
      .toFile(sourcePath);

    const lowQuality = await selectImageVariantWidths({
      formatSettings: resolveImageVariantFormatSettings({
        webp: { effort: 0, quality: 10 },
      }),
      sourcePath,
      widths: [160],
    });
    const highQuality = await selectImageVariantWidths({
      formatSettings: resolveImageVariantFormatSettings({
        webp: { effort: 0, quality: 100 },
      }),
      sourcePath,
      widths: [160],
    });

    expect(lowQuality.webp).toEqual([160]);
    expect(highQuality.webp).toEqual([]);
  });

  it('resolves defaults and validates compression settings', () => {
    expect(resolveImageVariantFormatSettings()).toEqual({
      avif: { quality: 60 },
      webp: { quality: 80 },
    });
    expect(() =>
      resolveImageVariantFormatSettings({ avif: { quality: 0 } }),
    ).toThrow('avif.quality must be an integer between 1 and 100');
    expect(() =>
      resolveImageVariantFormatSettings({ webp: { effort: 7 } }),
    ).toThrow('webp.effort must be an integer between 0 and 6');
  });

  it('keeps animated WebP sources as fallback-only images', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = path.join(directory, 'animated.webp');
    const animatedGif = Buffer.from(
      [
        '47494638396101000100800000000000ffffff',
        '21ff0b4e45545343415045322e300301000000',
        '21f904000a0000002c0000000001000100000202440100',
        '21f904000a0000002c00000000010001000002024c0100',
        '3b',
      ].join(''),
      'hex',
    );
    await sharp(animatedGif, { animated: true }).webp().toFile(sourcePath);

    const metadata = await sharp(sourcePath, { animated: true }).metadata();
    expect(metadata.pages).toBe(2);
    await expect(
      selectImageVariantWidths({ sourcePath, widths: [1, 2] }),
    ).resolves.toEqual({ avif: [], webp: [] });
  });

  it('never creates an AVIF candidate for lossless requests', async () => {
    const directory = await createTemporaryDirectory();
    const sourcePath = path.join(directory, 'code.png');
    await sharp({
      create: {
        background: 'white',
        channels: 3,
        height: 120,
        width: 120,
      },
    })
      .png({ compressionLevel: 0 })
      .toFile(sourcePath);

    const variants = await selectImageVariantWidths({
      lossless: true,
      sourcePath,
      widths: [60],
    });
    expect(variants.avif).toEqual([]);
    expect(variants.webp).toEqual([60]);
  });
});

async function createTemporaryDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-transform-'));
  temporaryDirectories.push(directory);
  return directory;
}
