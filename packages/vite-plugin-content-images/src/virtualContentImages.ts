import path from 'node:path';
import { normalizePath } from 'vite';
import type { ContentImageManifest } from './types.ts';

export const contentImagesVirtualModuleId = 'virtual:content-images';
export const contentImageSourceVirtualModuleId = 'virtual:content-image-source';
const contentImageSourceExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

type CreateContentImagesVirtualModuleOptions = {
  manifest: ContentImageManifest;
  publicPath: string;
  sourceId: string;
  widths: readonly number[];
};

export type ContentImagesVirtualModuleRequest = Readonly<{
  sourceId: string;
  widths: readonly number[];
}>;

export function parseContentImagesVirtualModuleRequest(
  id: string,
): ContentImagesVirtualModuleRequest | null {
  const unresolvedId = id.startsWith('\0') ? id.slice(1) : id;
  const queryIndex = unresolvedId.indexOf('?');
  const moduleId =
    queryIndex === -1 ? unresolvedId : unresolvedId.slice(0, queryIndex);

  if (moduleId !== contentImagesVirtualModuleId) {
    return null;
  }
  if (queryIndex === -1) {
    return null;
  }

  const query = unresolvedId.slice(queryIndex + 1);
  const parameters = new URLSearchParams(query);
  const sourceId = getSingleParameter(parameters, 'source');
  if (!sourceId) {
    throw new Error(
      `${contentImagesVirtualModuleId} requires a source query, for example ` +
        `'${contentImagesVirtualModuleId}?source=content&widths=320;640'`,
    );
  }
  validateSourceId(sourceId);
  const rawWidths = getSingleParameter(parameters, 'widths');
  if (!rawWidths) {
    throw new Error(
      `${contentImagesVirtualModuleId} requires a widths query, for example ` +
        `'${contentImagesVirtualModuleId}?source=content&widths=320;640'`,
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
      `${contentImagesVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  return {
    sourceId,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveContentImagesVirtualModuleId(id: string) {
  const request = parseContentImagesVirtualModuleRequest(id);
  return request
    ? `\0${contentImagesVirtualModuleId}?source=${request.sourceId}&widths=${request.widths.join(';')}`
    : null;
}

export function createContentImagesVirtualModule({
  manifest,
  publicPath,
  sourceId,
  widths,
}: CreateContentImagesVirtualModuleOptions) {
  const normalizedPublicPath = `/${publicPath.replace(/^\/+|\/+$/g, '')}`;
  const publicPathPrefix = `${normalizedPublicPath}/`;
  const widthDirective = widths.join(';');
  const imports: string[] = [];
  const entries: string[] = [];

  for (const [publicUrl, entry] of Object.entries(manifest)) {
    if (!publicUrl.startsWith(publicPathPrefix)) {
      throw new Error(
        `Content image URL must start with ${publicPathPrefix}: ${publicUrl}`,
      );
    }

    const relativePath = publicUrl.slice(publicPathPrefix.length);
    const index = entries.length;
    const avifIdentifier = `contentImageAvif${index}`;
    const webpIdentifier = `contentImageWebp${index}`;

    imports.push(
      createVariantImport({
        format: 'avif',
        identifier: avifIdentifier,
        quality: 50,
        relativePath,
        sourceId,
        widths: widthDirective,
      }),
      createVariantImport({
        format: 'webp',
        identifier: webpIdentifier,
        quality: 80,
        relativePath,
        sourceId,
        widths: widthDirective,
      }),
    );
    entries.push(
      `${JSON.stringify(publicUrl)}:{avif:toVariants(${avifIdentifier}),height:${entry.height},src:${JSON.stringify(entry.src)},webp:toVariants(${webpIdentifier}),width:${entry.width}}`,
    );
  }

  return [
    ...imports,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const contentImageManifest={${entries.join(',')}};`,
    'export { contentImageManifest };',
    'export default contentImageManifest;',
  ].join('\n');
}

export function resolveContentImageSource(
  id: string,
  sourceDirectories: ReadonlyMap<string, string>,
) {
  const queryIndex = id.indexOf('?');
  const moduleId = queryIndex === -1 ? id : id.slice(0, queryIndex);
  if (moduleId !== contentImageSourceVirtualModuleId) {
    return null;
  }
  if (queryIndex === -1) {
    return null;
  }

  const query = id.slice(queryIndex + 1);
  const parameters = new URLSearchParams(query);
  const sourceId = getSingleParameter(parameters, 'source');
  if (!sourceId) {
    throw new Error(`${contentImageSourceVirtualModuleId} requires source`);
  }
  validateSourceId(sourceId);
  const sourceDirectory = sourceDirectories.get(sourceId);
  if (!sourceDirectory) {
    throw new Error(`Unknown content image source: ${sourceId}`);
  }
  const relativePath = getSingleParameter(parameters, 'src');
  if (!relativePath) {
    throw new Error(`${contentImageSourceVirtualModuleId} requires src`);
  }

  const sourcePath = path.resolve(sourceDirectory, relativePath);
  if (!isPathInside(sourceDirectory, sourcePath)) {
    throw new Error(
      `${contentImageSourceVirtualModuleId} src must stay inside its source directory: ${relativePath}`,
    );
  }
  if (
    !contentImageSourceExtensions.has(path.extname(sourcePath).toLowerCase())
  ) {
    throw new Error(
      `${contentImageSourceVirtualModuleId} src must be a supported static image: ${relativePath}`,
    );
  }

  parameters.delete('source');
  parameters.delete('src');
  return `${normalizePath(sourcePath)}?${parameters}`;
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
  relativePath: string;
  sourceId: string;
  widths: string;
};

function createVariantImport({
  format,
  identifier,
  quality,
  relativePath,
  sourceId,
  widths,
}: CreateVariantImportOptions) {
  const parameters = new URLSearchParams({
    as: 'metadata:src;width',
    format,
    quality: String(quality),
    src: relativePath,
    source: sourceId,
    w: widths,
  });

  return `import ${identifier} from ${JSON.stringify(`${contentImageSourceVirtualModuleId}?${parameters}`)};`;
}

function getSingleParameter(parameters: URLSearchParams, name: string) {
  const values = parameters.getAll(name);
  if (values.length > 1) {
    throw new Error(
      `${contentImagesVirtualModuleId} requires exactly one ${name} query parameter`,
    );
  }
  return values[0] || null;
}

function validateSourceId(sourceId: string) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(sourceId)) {
    throw new Error(
      `${contentImagesVirtualModuleId} source must match [a-z0-9][a-z0-9_-]*: ${sourceId}`,
    );
  }
}
