import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import {
  createImageTransformImport,
  createImageVariantFormatDirectives,
  defaultImageVariantFormatSettings,
  type ImageVariantFormatSettings,
  type ImageVariantWidths,
  type RequestedImageVariantWidth,
  type ResolvedImageVariantFormatOptions,
  selectImageVariantWidths,
} from '../image/transform.ts';
import type { ImageVariantManifest } from '../types.ts';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

export const reactImageCollectionVirtualModuleId =
  'virtual:react-optimized-responsive-image/collection';

type CreateReactImageCollectionVirtualModuleOptions = {
  base: string;
  formatSettings?: ImageVariantFormatSettings;
  lossless?: boolean;
  manifest: ImageVariantManifest;
  sourceDirectory: string;
  variantWidths: Readonly<Record<string, ImageVariantWidths | undefined>>;
};

export type ReactImageCollectionVirtualModuleRequest = Readonly<{
  base: string;
  src: string;
  widths: readonly RequestedImageVariantWidth[];
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
  const numericWidthTokens = widthTokens.filter(
    (width) => width !== 'original',
  );
  if (
    numericWidthTokens.some((width) => {
      const numericWidth = Number(width);
      return (
        !/^\d+$/.test(width) ||
        !Number.isSafeInteger(numericWidth) ||
        numericWidth <= 0
      );
    })
  ) {
    throw new Error(
      `${reactImageCollectionVirtualModuleId} widths must be positive integers or original: ${rawWidths}`,
    );
  }

  return {
    base,
    src,
    widths: [
      ...new Set(numericWidthTokens.map(Number).sort((a, b) => a - b)),
      ...(widthTokens.includes('original') ? (['original'] as const) : []),
    ],
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
  formatSettings = defaultImageVariantFormatSettings,
  lossless = false,
  manifest,
  sourceDirectory,
  variantWidths,
}: CreateReactImageCollectionVirtualModuleOptions) {
  const publicPathPrefix = `${base}/`;
  const imports: string[] = [];
  const entries: string[] = [];

  for (const [publicUrl, entry] of Object.entries(manifest)) {
    if (!entry) {
      continue;
    }

    const sourcePath = resolveManifestSourcePath({
      publicPathPrefix,
      publicUrl,
      sourceDirectory,
    });

    const index = entries.length;
    const originalIdentifier = `imageVariantOriginal${index}`;
    const avifIdentifier = `imageVariantAvif${index}`;
    const webpIdentifier = `imageVariantWebp${index}`;
    const entryVariantWidths = variantWidths[publicUrl] ?? {
      avif: [],
      webp: [],
    };
    const hasAvifVariants = !lossless && entryVariantWidths.avif.length > 0;
    const hasWebpVariants = entryVariantWidths.webp.length > 0;

    imports.push(
      `import ${originalIdentifier} from ${JSON.stringify(`${sourcePath}?url`)};`,
    );
    if (hasAvifVariants) {
      imports.push(
        createVariantImport({
          format: 'avif',
          identifier: avifIdentifier,
          options: formatSettings.avif,
          sourcePath,
          widths: entryVariantWidths.avif.join(';'),
        }),
      );
    }
    if (hasWebpVariants) {
      imports.push(
        createVariantImport({
          format: 'webp',
          identifier: webpIdentifier,
          lossless,
          options: formatSettings.webp,
          sourcePath,
          widths: entryVariantWidths.webp.join(';'),
        }),
      );
    }
    entries.push(
      `${JSON.stringify(publicUrl)}:{avif:${hasAvifVariants ? `toVariants(${avifIdentifier})` : '[]'},height:${entry.height},src:${originalIdentifier},webp:${hasWebpVariants ? `toVariants(${webpIdentifier})` : '[]'},width:${entry.width}}`,
    );
  }

  return createReactImageCollectionModuleCode([
    ...imports,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariantManifest={${entries.join(',')}};`,
  ]);
}

export async function selectReactImageCollectionVariantWidths({
  base,
  formatSettings = defaultImageVariantFormatSettings,
  lossless = false,
  manifest,
  sourceDirectory,
  widths,
}: Omit<CreateReactImageCollectionVirtualModuleOptions, 'variantWidths'> & {
  widths: readonly RequestedImageVariantWidth[];
}) {
  const publicPathPrefix = `${base}/`;
  const publicUrls = Object.keys(manifest).filter(
    (publicUrl) => manifest[publicUrl] !== undefined,
  );
  const variants: [string, ImageVariantWidths][] = [];
  const batchSize = 4;
  for (let index = 0; index < publicUrls.length; index += batchSize) {
    const batch = publicUrls.slice(index, index + batchSize);
    variants.push(
      ...(await Promise.all(
        batch.map(async (publicUrl) => {
          const sourcePath = resolveManifestSourcePath({
            publicPathPrefix,
            publicUrl,
            sourceDirectory,
          });
          return [
            publicUrl,
            await selectImageVariantWidths({
              formatSettings,
              lossless,
              sourcePath,
              widths,
            }),
          ] satisfies [string, ImageVariantWidths];
        }),
      )),
    );
  }

  return Object.fromEntries(variants) as Readonly<
    Record<string, ImageVariantWidths>
  >;
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
  lossless?: boolean;
  options: ResolvedImageVariantFormatOptions;
  sourcePath: string;
  widths: string;
};

function createVariantImport({
  format,
  identifier,
  lossless = false,
  options,
  sourcePath,
  widths,
}: CreateVariantImportOptions) {
  const source = createImageTransformImport(sourcePath, {
    allowUpscale: 'true',
    as: 'metadata:src;width',
    ...createImageVariantFormatDirectives({ format, lossless, options }),
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

function resolveManifestSourcePath({
  publicPathPrefix,
  publicUrl,
  sourceDirectory,
}: Readonly<{
  publicPathPrefix: string;
  publicUrl: string;
  sourceDirectory: string;
}>) {
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
  return sourcePath;
}

function createReactImageCollectionModuleCode(statements: string[]) {
  return [
    `import { createReactImageCollection } from ${JSON.stringify('@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react')};`,
    ...statements,
    'const ReactImageCollection=createReactImageCollection(imageVariantManifest);',
    'export { imageVariantManifest as manifest };',
    'export default ReactImageCollection;',
  ].join('\n');
}
