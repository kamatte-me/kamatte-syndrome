import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';

export const socialImageCollectionVirtualModuleId =
  'virtual:optimized-social-image/collection';

export type SocialImageCollectionVirtualModuleRequest = Readonly<{
  base: string;
  src: string;
  width: number;
}>;

export type ResolvedSocialImageCollectionVirtualModule =
  SocialImageCollectionVirtualModuleRequest &
    Readonly<{
      id: string;
      sourceDirectory: string;
      watchDirectory: string;
    }>;

export function parseSocialImageCollectionVirtualModuleRequest(
  id: string,
): SocialImageCollectionVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const requestModuleId = queryIndex === -1 ? id : id.slice(0, queryIndex);
  if (
    requestModuleId !== socialImageCollectionVirtualModuleId ||
    queryIndex === -1
  ) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  assertKnownQueryParameters(parameters, ['src', 'base', 'width']);
  const src = getSingleQueryParameter(parameters, 'src');
  if (!src) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} requires a src query, for example ` +
        `'${socialImageCollectionVirtualModuleId}?src=/content/media&base=/media&width=1200'`,
    );
  }
  if (/[?#]/.test(src)) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} src must not contain ? or #: ${src}`,
    );
  }

  const rawBase = getSingleQueryParameter(parameters, 'base');
  if (!rawBase) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} requires a base query, for example ` +
        `'${socialImageCollectionVirtualModuleId}?src=/content/media&base=/media&width=1200'`,
    );
  }
  if (/[?#]/.test(rawBase)) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} base must not contain ? or #: ${rawBase}`,
    );
  }

  const rawWidth = getSingleQueryParameter(parameters, 'width');
  if (!rawWidth || !/^\d+$/.test(rawWidth)) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} width must be a positive integer: ${rawWidth ?? ''}`,
    );
  }
  const width = Number(rawWidth);
  if (!Number.isSafeInteger(width) || width <= 0) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} width must be a positive integer: ${rawWidth}`,
    );
  }

  return { base: normalizeBase(rawBase), src, width };
}

export function resolveSocialImageCollectionSourceDirectory({
  importer,
  rootDirectory,
  src,
}: Readonly<{
  importer: string | undefined;
  rootDirectory: string;
  src: string;
}>) {
  if (src.startsWith('/')) {
    const sourceDirectory = normalizePath(
      path.resolve(rootDirectory, `.${src}`),
    );
    if (!isPathInside(rootDirectory, sourceDirectory)) {
      throw new Error(
        `${socialImageCollectionVirtualModuleId} root-absolute src must stay inside the Vite root: ${src}`,
      );
    }
    return sourceDirectory;
  }

  if (!src.startsWith('.')) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} src must be Vite-root-absolute or importer-relative: ${src}`,
    );
  }
  if (!importer || importer.startsWith('\0')) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }

  const importerPath = importer.split('?')[0];
  if (!importerPath) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }
  return normalizePath(path.resolve(path.dirname(importerPath), src));
}

export function resolveSocialImageCollectionVirtualModule({
  base,
  sourceDirectory,
  src,
  watchDirectory = sourceDirectory,
  width,
}: SocialImageCollectionVirtualModuleRequest & {
  sourceDirectory: string;
  watchDirectory?: string;
}) {
  const normalizedSourceDirectory = normalizePath(sourceDirectory);
  const normalizedWatchDirectory = normalizePath(watchDirectory);
  const hash = createHash('sha256')
    .update(`${normalizedSourceDirectory}\0${base}\0${width}`)
    .digest('hex');

  return {
    base,
    id: `\0${socialImageCollectionVirtualModuleId}:resolved:${hash}`,
    sourceDirectory: normalizedSourceDirectory,
    src,
    watchDirectory: normalizedWatchDirectory,
    width,
  } satisfies ResolvedSocialImageCollectionVirtualModule;
}

export function isPathInside(directory: string, filePath: string) {
  const relativePath = path.relative(path.resolve(directory), filePath);
  return (
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

function assertKnownQueryParameters(
  parameters: URLSearchParams,
  knownParameters: readonly string[],
) {
  for (const parameter of parameters.keys()) {
    if (!knownParameters.includes(parameter)) {
      throw new Error(
        `${socialImageCollectionVirtualModuleId} does not support the ${parameter} query parameter`,
      );
    }
  }
}

function getSingleQueryParameter(parameters: URLSearchParams, name: string) {
  const values = parameters.getAll(name);
  if (values.length > 1) {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} accepts at most one ${name} query parameter`,
    );
  }
  return values[0];
}

function normalizeBase(base: string) {
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  if (normalizedBase === '/') {
    throw new Error(
      `${socialImageCollectionVirtualModuleId} base must not be the root path`,
    );
  }
  return normalizedBase;
}
