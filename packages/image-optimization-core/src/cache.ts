import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type CachedAsset<TMetadata> = Readonly<{
  buffer: Buffer;
  metadata: TMetadata;
}>;

export async function readCachedAsset<TMetadata>({
  cacheDirectory,
  cacheKey,
  fileExtension,
  parseMetadata,
}: Readonly<{
  cacheDirectory: string;
  cacheKey: string;
  fileExtension: string;
  parseMetadata: (metadata: unknown) => TMetadata | undefined;
}>): Promise<CachedAsset<TMetadata> | undefined> {
  try {
    const [buffer, serializedMetadata] = await Promise.all([
      readFile(
        path.join(cacheDirectory, 'assets', `${cacheKey}.${fileExtension}`),
      ),
      readFile(
        path.join(cacheDirectory, 'metadata', `${cacheKey}.json`),
        'utf8',
      ),
    ]);
    const metadata = parseMetadata(JSON.parse(serializedMetadata));
    return metadata ? { buffer, metadata } : undefined;
  } catch {
    return undefined;
  }
}

export async function writeCachedAsset<TMetadata>({
  buffer,
  cacheDirectory,
  cacheKey,
  fileExtension,
  metadata,
}: Readonly<{
  buffer: Buffer;
  cacheDirectory: string;
  cacheKey: string;
  fileExtension: string;
  metadata: TMetadata;
}>) {
  const assetDirectory = path.join(cacheDirectory, 'assets');
  const metadataDirectory = path.join(cacheDirectory, 'metadata');
  await Promise.all([
    mkdir(assetDirectory, { recursive: true }),
    mkdir(metadataDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeAtomically({
      data: buffer,
      filePath: path.join(assetDirectory, `${cacheKey}.${fileExtension}`),
    }),
    writeAtomically({
      data: JSON.stringify(metadata),
      filePath: path.join(metadataDirectory, `${cacheKey}.json`),
    }),
  ]);
}

async function writeAtomically({
  data,
  filePath,
}: Readonly<{
  data: string | Uint8Array;
  filePath: string;
}>) {
  const temporaryPath = `${filePath}.${process.pid}-${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, data);
    await rename(temporaryPath, filePath);
  } finally {
    try {
      await rm(temporaryPath, { force: true });
    } catch {
      // A failed cleanup only leaves an unused temporary cache file.
    }
  }
}
