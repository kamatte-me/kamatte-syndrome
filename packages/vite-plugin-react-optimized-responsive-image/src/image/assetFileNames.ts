import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { normalizePath } from 'vite';

const defaultAssetFileNames = 'assets/[name]-[hash][extname]';

type PreRenderedAsset = Readonly<{
  name?: string;
  names: string[];
  originalFileNames: string[];
  source: string | Uint8Array;
  type: 'asset';
}>;

type AssetFileNames =
  | string
  | ((assetInfo: PreRenderedAsset) => string)
  | undefined;

export function addImageSourcePath(
  imageSourcePaths: Set<string>,
  sourcePath: string,
) {
  imageSourcePaths.add(normalizeSourcePath(sourcePath));
  try {
    imageSourcePaths.add(normalizeSourcePath(realpathSync(sourcePath)));
  } catch {
    // Vite reports a missing image source while resolving its virtual module.
  }
}

export function createImageAssetFileNames({
  assetFileNames,
  imageSourcePaths,
  rootDirectory,
}: Readonly<{
  assetFileNames: AssetFileNames;
  imageSourcePaths: ReadonlySet<string>;
  rootDirectory: string;
}>) {
  return (assetInfo: PreRenderedAsset) => {
    const sourcePath = findImageSourcePath({
      imageSourcePaths,
      originalFileNames: assetInfo.originalFileNames,
      rootDirectory,
    });
    if (!sourcePath) {
      return resolveAssetFileName(assetFileNames, assetInfo);
    }

    const extension = path.extname(assetInfo.names[0] ?? assetInfo.name ?? '');
    if (!extension) {
      return resolveAssetFileName(assetFileNames, assetInfo);
    }

    const original = isOriginalImageAsset(assetInfo.source, sourcePath);
    const dimensions = original
      ? undefined
      : getImageDimensions(assetInfo.source);
    if (!original && dimensions === undefined) {
      return resolveAssetFileName(assetFileNames, assetInfo);
    }

    const sourceName = path.basename(sourcePath, path.extname(sourcePath));
    return `assets/${sourceName}${dimensions === undefined ? '' : `.${dimensions.width}x${dimensions.height}`}.[hash]${extension}`;
  };
}

function findImageSourcePath({
  imageSourcePaths,
  originalFileNames,
  rootDirectory,
}: Readonly<{
  imageSourcePaths: ReadonlySet<string>;
  originalFileNames: readonly string[];
  rootDirectory: string;
}>) {
  for (const originalFileName of originalFileNames) {
    const sourcePath = path.resolve(rootDirectory, originalFileName);
    if (imageSourcePaths.has(normalizeSourcePath(sourcePath))) {
      return sourcePath;
    }
    try {
      const realSourcePath = realpathSync(sourcePath);
      if (imageSourcePaths.has(normalizeSourcePath(realSourcePath))) {
        return realSourcePath;
      }
    } catch {
      // The asset may have been removed after Vite read it.
    }
  }
}

function resolveAssetFileName(
  assetFileNames: AssetFileNames,
  assetInfo: PreRenderedAsset,
) {
  return typeof assetFileNames === 'function'
    ? assetFileNames(assetInfo)
    : (assetFileNames ?? defaultAssetFileNames);
}

function isOriginalImageAsset(source: string | Uint8Array, sourcePath: string) {
  if (typeof source === 'string') {
    return false;
  }
  try {
    return Buffer.from(source).equals(readFileSync(sourcePath));
  } catch {
    return false;
  }
}

function getImageDimensions(source: string | Uint8Array) {
  if (typeof source === 'string') {
    return undefined;
  }

  const image = Buffer.from(source);
  return getAvifDimensions(image) ?? getWebpDimensions(image);
}

function getAvifDimensions(image: Buffer) {
  const imageProperties = Buffer.from('ispe');
  let offset = image.indexOf(imageProperties);
  while (offset !== -1) {
    const widthOffset = offset + imageProperties.length + 4;
    const heightOffset = widthOffset + 4;
    if (heightOffset + 4 <= image.length) {
      const width = image.readUInt32BE(widthOffset);
      const height = image.readUInt32BE(heightOffset);
      if (width > 0 && height > 0) {
        return { height, width };
      }
    }
    offset = image.indexOf(imageProperties, offset + imageProperties.length);
  }
}

function getWebpDimensions(image: Buffer) {
  if (
    image.length < 20 ||
    image.toString('ascii', 0, 4) !== 'RIFF' ||
    image.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    return undefined;
  }

  let offset = 12;
  while (offset + 8 <= image.length) {
    const chunk = image.toString('ascii', offset, offset + 4);
    const size = image.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + size > image.length) {
      return undefined;
    }

    if (chunk === 'VP8X' && size >= 10) {
      return {
        height: 1 + image.readUIntLE(dataOffset + 7, 3),
        width: 1 + image.readUIntLE(dataOffset + 4, 3),
      };
    }
    if (chunk === 'VP8 ' && size >= 10) {
      return {
        height: image.readUInt16LE(dataOffset + 8) & 0x3fff,
        width: image.readUInt16LE(dataOffset + 6) & 0x3fff,
      };
    }
    if (chunk === 'VP8L' && size >= 5 && image[dataOffset] === 0x2f) {
      const dimensions = image.readUInt32LE(dataOffset + 1);
      return {
        height: 1 + ((dimensions >>> 14) & 0x3fff),
        width: 1 + (dimensions & 0x3fff),
      };
    }

    offset = dataOffset + size + (size % 2);
  }
}

function normalizeSourcePath(sourcePath: string) {
  return normalizePath(path.resolve(sourcePath));
}
