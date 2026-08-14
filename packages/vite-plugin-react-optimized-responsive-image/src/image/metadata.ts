import path from 'node:path';
import {
  getImageDisplayDimensions,
  listSupportedImageFiles,
  toPosixPath,
} from '@kamatte-syndrome/image-optimization-core';
import sharp from 'sharp';
import type { ImageVariantEntry, ImageVariantManifest } from '../types.ts';

export { getImageDisplayDimensions };

export type ScanImageVariantManifestOptions = Readonly<{
  publicPath: string;
  sourceDirectory: string;
}>;

/**
 * Reads image metadata without modifying the source directory or writing
 * public assets. Original assets and responsive variants are added later by
 * the Vite module.
 */
export async function scanImageVariantManifest({
  publicPath,
  sourceDirectory,
}: ScanImageVariantManifestOptions): Promise<ImageVariantManifest> {
  const normalizedPublicPath = normalizePublicPath(publicPath);
  const manifest: Record<string, ImageVariantEntry> = {};

  for (const relativePath of await listSupportedImageFiles(sourceDirectory)) {
    if (/[?#]/.test(relativePath)) {
      throw new Error(
        `Image source path must not contain ? or #: ${toPosixPath(relativePath)}`,
      );
    }
    const sourcePath = path.join(sourceDirectory, relativePath);
    const publicUrl = `${normalizedPublicPath}/${toPosixPath(relativePath)}`;

    try {
      const metadata = await sharp(sourcePath).metadata();
      const { height, width } = getImageDisplayDimensions(metadata);

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
        `Failed to read image metadata: ${toPosixPath(relativePath)}`,
        { cause: error },
      );
    }
  }

  return manifest;
}

function normalizePublicPath(publicPath: string) {
  const trimmedPath = publicPath.replace(/^\/+|\/+$/g, '');
  return trimmedPath ? `/${trimmedPath}` : '';
}
