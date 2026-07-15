import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import {
  clampImageWidths,
  createImageTransformImport,
  imageVariantAvifQuality,
  imageVariantWebpQuality,
} from '../image/transform.ts';
import type { ImageVariantManifest } from '../types.ts';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

export const reactImageCollectionVirtualModuleId =
  'virtual:react-image/collection';

type CreateReactImageCollectionVirtualModuleOptions = {
  base: string;
  manifest: ImageVariantManifest;
  sourceDirectory: string;
  widths: readonly number[];
};

export type ReactImageCollectionVirtualModuleRequest = Readonly<{
  base: string;
  src: string;
  widths: readonly number[];
}>;

export type ResolvedReactImageCollectionVirtualModule =
  ReactImageCollectionVirtualModuleRequest &
    Readonly<{
      id: string;
      sourceDirectory: string;
      watchDirectory: string;
    }>;

export function parseReactImageCollectionVirtualModuleRequest(
  id: string,
): ReactImageCollectionVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const requestModuleId = queryIndex === -1 ? id : id.slice(0, queryIndex);

  if (
    requestModuleId !== reactImageCollectionVirtualModuleId ||
    queryIndex === -1
  ) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  assertKnownQueryParameters(
    parameters,
    ['src', 'base', 'widths'],
    reactImageCollectionVirtualModuleId,
  );
  const src = getSingleQueryParameter(
    parameters,
    'src',
    reactImageCollectionVirtualModuleId,
  );
  if (!src) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} requires a src query, for example ` +
        `'${reactImageCollectionVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
    );
  }
  if (/[?#]/.test(src)) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} src must not contain ? or #: ${src}`,
    );
  }

  const rawBase = getSingleQueryParameter(
    parameters,
    'base',
    reactImageCollectionVirtualModuleId,
  );
  if (!rawBase) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} requires a base query, for example ` +
        `'${reactImageCollectionVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
    );
  }
  if (/[?#]/.test(rawBase)) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} base must not contain ? or #: ${rawBase}`,
    );
  }
  const base = normalizeBase(rawBase);

  const rawWidths = getSingleQueryParameter(
    parameters,
    'widths',
    reactImageCollectionVirtualModuleId,
  );
  if (!rawWidths) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} requires a widths query, for example ` +
        `'${reactImageCollectionVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
    );
  }

  const widthTokens = rawWidths.split(/[;,]/);
  if (
    widthTokens.some((width) => {
      const numericWidth = Number(width);
      return (
        !/^\d+$/.test(width) ||
        !Number.isSafeInteger(numericWidth) ||
        numericWidth <= 0
      );
    })
  ) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  return {
    base,
    src,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveReactImageCollectionSourceDirectory({
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
        `${reactImageCollectionVirtualModuleId} root-absolute src must stay inside the Vite root: ${src}`,
      );
    }
    return sourceDirectory;
  }

  if (!src.startsWith('.')) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} src must be Vite-root-absolute or importer-relative: ${src}`,
    );
  }
  if (!importer || importer.startsWith('\0')) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }

  const importerPath = importer.split('?')[0];
  if (!importerPath) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }

  return normalizePath(path.resolve(path.dirname(importerPath), src));
}

export function resolveReactImageCollectionVirtualModule({
  base,
  sourceDirectory,
  src,
  watchDirectory = sourceDirectory,
  widths,
}: ReactImageCollectionVirtualModuleRequest & {
  sourceDirectory: string;
  watchDirectory?: string;
}) {
  const normalizedSourceDirectory = normalizePath(sourceDirectory);
  const normalizedWatchDirectory = normalizePath(watchDirectory);
  const hash = createHash('sha256')
    .update(`${normalizedSourceDirectory}\0${base}\0${widths.join(';')}`)
    .digest('hex');

  return {
    base,
    id: `\0${reactImageCollectionVirtualModuleId}:resolved:${hash}`,
    sourceDirectory: normalizedSourceDirectory,
    src,
    watchDirectory: normalizedWatchDirectory,
    widths,
  } satisfies ResolvedReactImageCollectionVirtualModule;
}

export function createReactImageCollectionVirtualModule({
  base,
  manifest,
  sourceDirectory,
  widths,
}: CreateReactImageCollectionVirtualModuleOptions) {
  const publicPathPrefix = `${base}/`;
  const imports: string[] = [];
  const entries: string[] = [];

  for (const [publicUrl, entry] of Object.entries(manifest)) {
    if (!publicUrl.startsWith(publicPathPrefix)) {
      throw new Error(
        `Image variant URL must start with ${publicPathPrefix}: ${publicUrl}`,
      );
    }

    const relativePath = publicUrl.slice(publicPathPrefix.length);
    const sourcePath = normalizePath(path.join(sourceDirectory, relativePath));
    if (!isPathInside(sourceDirectory, sourcePath)) {
      throw new Error(
        `Image source path must stay inside its source directory: ${relativePath}`,
      );
    }

    const index = entries.length;
    const originalIdentifier = `imageVariantOriginal${index}`;
    const avifIdentifier = `imageVariantAvif${index}`;
    const webpIdentifier = `imageVariantWebp${index}`;
    const widthDirective = clampImageWidths(widths, entry.width).join(';');

    imports.push(
      `import ${originalIdentifier} from ${JSON.stringify(sourcePath)};`,
      createVariantImport({
        format: 'avif',
        identifier: avifIdentifier,
        quality: imageVariantAvifQuality,
        sourcePath,
        widths: widthDirective,
      }),
      createVariantImport({
        format: 'webp',
        identifier: webpIdentifier,
        quality: imageVariantWebpQuality,
        sourcePath,
        widths: widthDirective,
      }),
    );
    entries.push(
      `${JSON.stringify(publicUrl)}:{avif:toVariants(${avifIdentifier}),height:${entry.height},src:${originalIdentifier},webp:toVariants(${webpIdentifier}),width:${entry.width}}`,
    );
  }

  return createReactImageCollectionModuleCode([
    ...imports,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariantManifest={${entries.join(',')}};`,
  ]);
}

export function createEmptyReactImageCollectionVirtualModule() {
  return createReactImageCollectionModuleCode([
    'const imageVariantManifest={};',
  ]);
}

export function isPathInside(directory: string, filePath: string) {
  const relativePath = path.relative(path.resolve(directory), filePath);
  return (
    relativePath !== '..' &&
    !relativePath.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relativePath)
  );
}

type CreateVariantImportOptions = {
  format: 'avif' | 'webp';
  identifier: string;
  quality: number;
  sourcePath: string;
  widths: string;
};

function createVariantImport({
  format,
  identifier,
  quality,
  sourcePath,
  widths,
}: CreateVariantImportOptions) {
  const source = createImageTransformImport(sourcePath, {
    allowUpscale: 'true',
    as: 'metadata:src;width',
    format,
    quality: String(quality),
    w: widths,
  });

  return `import ${identifier} from ${JSON.stringify(source)};`;
}

function normalizeBase(base: string) {
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  if (normalizedBase === '/') {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} base must not be root`,
    );
  }
  return normalizedBase;
}

function createReactImageCollectionModuleCode(statements: string[]) {
  return [
    `import { createReactImageCollection } from ${JSON.stringify('@kamatte-syndrome/vite-plugin-image-variants/react')};`,
    ...statements,
    'const ReactImageCollection=createReactImageCollection(imageVariantManifest);',
    'export { imageVariantManifest as manifest };',
    'export default ReactImageCollection;',
  ].join('\n');
}
