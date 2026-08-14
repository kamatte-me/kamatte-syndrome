import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const imageSourceExtensions = [
  '.avif',
  '.gif',
  '.heif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tiff',
  '.webp',
] as const;

const supportedImageExtensions = new Set<string>(imageSourceExtensions);

export function isPathInside(directory: string, filePath: string) {
  const relativePath = path.relative(path.resolve(directory), filePath);
  return (
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

export async function listSupportedImageFiles(
  directory: string,
  relativeDirectory = '',
): Promise<string[]> {
  const currentDirectory = path.join(directory, relativeDirectory);
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of [...entries].sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listSupportedImageFiles(directory, relativePath)));
      continue;
    }
    if (
      entry.isFile() &&
      supportedImageExtensions.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

export function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}
