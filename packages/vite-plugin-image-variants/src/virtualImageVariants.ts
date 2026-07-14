import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import { clampImageWidths } from './clampImageWidths.ts';
import type { ImageVariantManifest } from './types.ts';

export const imageVariantsVirtualModuleId = 'virtual:image-variants';
const resolvedImageVariantsVirtualModulePrefix =
  '\0virtual:image-variants:resolved:';

type CreateImageVariantsVirtualModuleOptions = {
  base: string;
  manifest: ImageVariantManifest;
  sourceDirectory: string;
  widths: readonly number[];
};

export type ImageVariantsVirtualModuleRequest = Readonly<{
  base: string;
  src: string;
  widths: readonly number[];
}>;

export type ResolvedImageVariantsVirtualModule =
  ImageVariantsVirtualModuleRequest &
    Readonly<{
      id: string;
      sourceDirectory: string;
      watchDirectory: string;
    }>;

export function parseImageVariantsVirtualModuleRequest(
  id: string,
): ImageVariantsVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const moduleId = queryIndex === -1 ? id : id.slice(0, queryIndex);

  if (moduleId !== imageVariantsVirtualModuleId || queryIndex === -1) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  const src = getSingleParameter(parameters, 'src');
  if (!src) {
    throw new Error(
      `${imageVariantsVirtualModuleId} requires a src query, for example ` +
        `'${imageVariantsVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
    );
  }
  if (/[?#]/.test(src)) {
    throw new Error(
      `${imageVariantsVirtualModuleId} src must not contain ? or #: ${src}`,
    );
  }

  const rawBase = getSingleParameter(parameters, 'base');
  if (!rawBase) {
    throw new Error(
      `${imageVariantsVirtualModuleId} requires a base query, for example ` +
        `'${imageVariantsVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
    );
  }
  if (/[?#]/.test(rawBase)) {
    throw new Error(
      `${imageVariantsVirtualModuleId} base must not contain ? or #: ${rawBase}`,
    );
  }
  const base = normalizeBase(rawBase);

  const rawWidths = getSingleParameter(parameters, 'widths');
  if (!rawWidths) {
    throw new Error(
      `${imageVariantsVirtualModuleId} requires a widths query, for example ` +
        `'${imageVariantsVirtualModuleId}?src=/content/media&base=/media&widths=320;640'`,
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
      `${imageVariantsVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  return {
    base,
    src,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveImageVariantsSourceDirectory({
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
        `${imageVariantsVirtualModuleId} root-absolute src must stay inside the Vite root: ${src}`,
      );
    }
    return sourceDirectory;
  }

  if (!src.startsWith('.')) {
    throw new Error(
      `${imageVariantsVirtualModuleId} src must be Vite-root-absolute or importer-relative: ${src}`,
    );
  }
  if (!importer || importer.startsWith('\0')) {
    throw new Error(
      `${imageVariantsVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }

  const importerPath = importer.split('?')[0];
  if (!importerPath) {
    throw new Error(
      `${imageVariantsVirtualModuleId} relative src requires an application importer: ${src}`,
    );
  }

  return normalizePath(path.resolve(path.dirname(importerPath), src));
}

export function resolveImageVariantsVirtualModule({
  base,
  sourceDirectory,
  src,
  watchDirectory = sourceDirectory,
  widths,
}: ImageVariantsVirtualModuleRequest & {
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
    id: `${resolvedImageVariantsVirtualModulePrefix}${hash}`,
    sourceDirectory: normalizedSourceDirectory,
    src,
    watchDirectory: normalizedWatchDirectory,
    widths,
  } satisfies ResolvedImageVariantsVirtualModule;
}

export function createImageVariantsVirtualModule({
  base,
  manifest,
  sourceDirectory,
  widths,
}: CreateImageVariantsVirtualModuleOptions) {
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
        quality: 60,
        sourcePath,
        widths: widthDirective,
      }),
      createVariantImport({
        format: 'webp',
        identifier: webpIdentifier,
        quality: 80,
        sourcePath,
        widths: widthDirective,
      }),
    );
    entries.push(
      `${JSON.stringify(publicUrl)}:{avif:toVariants(${avifIdentifier}),height:${entry.height},src:${originalIdentifier},webp:toVariants(${webpIdentifier}),width:${entry.width}}`,
    );
  }

  return [
    ...imports,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariantManifest={${entries.join(',')}};`,
    'export { imageVariantManifest };',
    'export default imageVariantManifest;',
  ].join('\n');
}

export function createEmptyImageVariantsVirtualModule() {
  return [
    'const imageVariantManifest={};',
    'export { imageVariantManifest };',
    'export default imageVariantManifest;',
  ].join('\n');
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
  const parameters = new URLSearchParams({
    allowUpscale: 'true',
    as: 'metadata:src;width',
    format,
    quality: String(quality),
    w: widths,
  });

  return `import ${identifier} from ${JSON.stringify(`${sourcePath}?${parameters}`)};`;
}

function getSingleParameter(parameters: URLSearchParams, name: string) {
  const values = parameters.getAll(name);
  if (values.length > 1) {
    throw new Error(
      `${imageVariantsVirtualModuleId} requires exactly one ${name} query parameter`,
    );
  }
  return values[0] || null;
}

function normalizeBase(base: string) {
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}`;
  if (normalizedBase === '/') {
    throw new Error(`${imageVariantsVirtualModuleId} base must not be root`);
  }
  return normalizedBase;
}
