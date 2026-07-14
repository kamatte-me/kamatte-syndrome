import { readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { ContentImageEntry, ContentImageManifest } from './types.ts';

const supportedImageExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

export type ScanContentImageManifestOptions = Readonly<{
  publicPath: string;
  sourceDirectory: string;
}>;

/**
 * Reads image metadata without modifying the source directory or writing
 * public assets. Original assets and responsive variants are added later by
 * the Vite module.
 */
export async function scanContentImageManifest({
  publicPath,
  sourceDirectory,
}: ScanContentImageManifestOptions): Promise<ContentImageManifest> {
  const normalizedPublicPath = normalizePublicPath(publicPath);
  const manifest: Record<string, ContentImageEntry> = {};

  for (const relativePath of await listSupportedImageFiles(sourceDirectory)) {
    if (/[?#]/.test(relativePath)) {
      throw new Error(
        `Content image path must not contain ? or #: ${toPosixPath(relativePath)}`,
      );
    }
    const sourcePath = path.join(sourceDirectory, relativePath);
    const publicUrl = `${normalizedPublicPath}/${toPosixPath(relativePath)}`;

    try {
      const metadata = await sharp(sourcePath).metadata();
      const { height, width } = metadata.autoOrient;

      if (!width || !height) {
        throw new Error('Image dimensions are unavailable');
      }

      manifest[publicUrl] = {
        avif: [],
        height,
        src: publicUrl,
        webp: [],
        width,
      };
    } catch (error) {
      throw new Error(
        `Failed to read content image metadata: ${toPosixPath(relativePath)}`,
        { cause: error },
      );
    }
  }

  return manifest;
}

async function listSupportedImageFiles(
  directory: string,
  relativeDirectory = '',
): Promise<string[]> {
  const currentDirectory = path.join(directory, relativeDirectory);
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of [...entries].sort((a, b) =>
    a.name.localeCompare(b.name),
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

function normalizePublicPath(publicPath: string) {
  const trimmedPath = publicPath.replace(/^\/+|\/+$/g, '');
  return trimmedPath ? `/${trimmedPath}` : '';
}

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join('/');
}
