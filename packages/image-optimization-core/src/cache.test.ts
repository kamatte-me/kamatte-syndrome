import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readCachedAsset, writeCachedAsset } from './cache.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('persistent image cache', () => {
  it('round-trips a transformed asset with validated metadata', async () => {
    const cacheDirectory = await createTemporaryDirectory();
    await writeCachedAsset({
      buffer: Buffer.from('image data'),
      cacheDirectory,
      cacheKey: 'cache-key',
      fileExtension: 'webp',
      metadata: { height: 30, width: 40 },
    });

    await expect(
      readCachedAsset({
        cacheDirectory,
        cacheKey: 'cache-key',
        fileExtension: 'webp',
        parseMetadata(metadata) {
          if (
            !isPositiveIntegerRecord(metadata, 'height') ||
            !isPositiveIntegerRecord(metadata, 'width')
          ) {
            return undefined;
          }
          return { height: metadata.height, width: metadata.width };
        },
      }),
    ).resolves.toEqual({
      buffer: Buffer.from('image data'),
      metadata: { height: 30, width: 40 },
    });
    await expect(
      readFile(path.join(cacheDirectory, 'metadata', 'cache-key.json'), 'utf8'),
    ).resolves.toBe('{"height":30,"width":40}');
  });

  it('treats invalid metadata as a cache miss', async () => {
    const cacheDirectory = await createTemporaryDirectory();
    await writeCachedAsset({
      buffer: Buffer.from('image data'),
      cacheDirectory,
      cacheKey: 'cache-key',
      fileExtension: 'webp',
      metadata: { width: 'invalid' },
    });

    await expect(
      readCachedAsset({
        cacheDirectory,
        cacheKey: 'cache-key',
        fileExtension: 'webp',
        parseMetadata(metadata) {
          return isPositiveIntegerRecord(metadata, 'width')
            ? { width: metadata.width }
            : undefined;
        },
      }),
    ).resolves.toBeUndefined();
  });
});

async function createTemporaryDirectory() {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'image-optimization-core-'),
  );
  temporaryDirectories.push(directory);
  return directory;
}

function isPositiveIntegerRecord(
  value: unknown,
  property: 'height' | 'width',
): value is Record<typeof property, number> {
  if (!isRecord(value)) {
    return false;
  }
  const candidate = value[property];
  return (
    typeof candidate === 'number' &&
    Number.isSafeInteger(candidate) &&
    candidate > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
