import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { isPathInside, listSupportedImageFiles, toPosixPath } from './files.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('image source file helpers', () => {
  it('checks whether a file is contained by a directory', () => {
    expect(
      isPathInside('/workspace/images', '/workspace/images/poster.png'),
    ).toBe(true);
    expect(isPathInside('/workspace/images', '/workspace/images')).toBe(true);
    expect(
      isPathInside('/workspace/images', '/workspace/images-other/a.png'),
    ).toBe(false);
    expect(isPathInside('/workspace/images', '/workspace/a.png')).toBe(false);
  });

  it('recursively lists supported image files in a stable order', async () => {
    const directory = await createTemporaryDirectory();
    await mkdir(path.join(directory, 'nested'));
    await Promise.all([
      writeFile(path.join(directory, 'zebra.webp'), ''),
      writeFile(path.join(directory, 'alpha.txt'), ''),
      writeFile(path.join(directory, 'nested', 'Photo.PNG'), ''),
      writeFile(path.join(directory, 'nested', 'vector.svg'), ''),
    ]);

    await expect(listSupportedImageFiles(directory)).resolves.toEqual([
      path.join('nested', 'Photo.PNG'),
      'zebra.webp',
    ]);
  });

  it('uses forward slashes for portable generated paths', () => {
    expect(toPosixPath(path.join('nested', 'poster.png'))).toBe(
      'nested/poster.png',
    );
  });
});

async function createTemporaryDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), 'image-source-files-'));
  temporaryDirectories.push(directory);
  return directory;
}
