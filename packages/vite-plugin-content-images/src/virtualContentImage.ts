import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';

export const contentImageVirtualModuleId = 'virtual:content-image';
const resolvedContentImageVirtualModulePrefix =
  '\0virtual:content-image:resolved:';
const supportedImageExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

export type ContentImageVirtualModuleRequest = Readonly<{
  lossless: boolean;
  src: string;
  widths: readonly number[];
}>;

export type ResolvedContentImageVirtualModule =
  ContentImageVirtualModuleRequest &
    Readonly<{
      id: string;
      sourcePath: string;
    }>;

export function parseContentImageVirtualModuleRequest(
  id: string,
): ContentImageVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const moduleId = queryIndex === -1 ? id : id.slice(0, queryIndex);

  if (moduleId !== contentImageVirtualModuleId || queryIndex === -1) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  const src = getSingleParameter(parameters, 'src');
  if (!src) {
    throw new Error(
      `${contentImageVirtualModuleId} requires a src query, for example ` +
        `'${contentImageVirtualModuleId}?src=./image.jpg&widths=160;320'`,
    );
  }

  const rawWidths = getSingleParameter(parameters, 'widths');
  if (!rawWidths) {
    throw new Error(
      `${contentImageVirtualModuleId} requires a widths query, for example ` +
        `'${contentImageVirtualModuleId}?src=./image.jpg&widths=160;320'`,
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
      `${contentImageVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  const rawLossless = getSingleParameter(parameters, 'lossless');
  if (rawLossless && rawLossless !== 'true' && rawLossless !== 'false') {
    throw new Error(
      `${contentImageVirtualModuleId} lossless must be true or false: ${rawLossless}`,
    );
  }

  return {
    lossless: rawLossless === 'true',
    src,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveContentImageVirtualModule({
  lossless,
  sourcePath,
  src,
  widths,
}: ContentImageVirtualModuleRequest & { sourcePath: string }) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (!supportedImageExtensions.has(extension)) {
    throw new Error(
      `${contentImageVirtualModuleId} src must be a supported static image: ${src}`,
    );
  }

  const normalizedSourcePath = normalizePath(sourcePath);
  const hash = createHash('sha256')
    .update(`${normalizedSourcePath}\0${widths.join(';')}\0${String(lossless)}`)
    .digest('hex');

  return {
    id: `${resolvedContentImageVirtualModulePrefix}${hash}`,
    lossless,
    sourcePath: normalizedSourcePath,
    src,
    widths,
  } satisfies ResolvedContentImageVirtualModule;
}

export function createContentImageVirtualModule({
  lossless,
  sourcePath,
  widths,
}: Pick<
  ResolvedContentImageVirtualModule,
  'lossless' | 'sourcePath' | 'widths'
>) {
  const fallbackImport = createImageImport(sourcePath, {
    as: 'metadata:src;width;height',
  });
  const avifImport = lossless
    ? null
    : createImageImport(sourcePath, {
        as: 'metadata:src;width',
        format: 'avif',
        quality: '60',
        w: widths.join(';'),
      });
  const webpImport = createImageImport(sourcePath, {
    as: 'metadata:src;width',
    format: 'webp',
    ...(lossless ? { lossless: 'true' } : { quality: '80' }),
    w: widths.join(';'),
  });

  return [
    `import contentImageFallback from ${JSON.stringify(fallbackImport)};`,
    ...(avifImport
      ? [`import contentImageAvif from ${JSON.stringify(avifImport)};`]
      : []),
    `import contentImageWebp from ${JSON.stringify(webpImport)};`,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const contentImage={avif:${avifImport ? 'toVariants(contentImageAvif)' : '[]'},height:contentImageFallback.height,src:contentImageFallback.src,webp:toVariants(contentImageWebp),width:contentImageFallback.width};`,
    'export { contentImage };',
    'export default contentImage;',
  ].join('\n');
}

export function createUnoptimizedContentImageVirtualModule({
  height,
  sourcePath,
  width,
}: Readonly<{ height: number; sourcePath: string; width: number }>) {
  return [
    `import contentImageFallback from ${JSON.stringify(sourcePath)};`,
    `const contentImage={avif:[],height:${height},src:contentImageFallback,webp:[],width:${width}};`,
    'export { contentImage };',
    'export default contentImage;',
  ].join('\n');
}

function createImageImport(
  sourcePath: string,
  directives: Record<string, string>,
) {
  return `${sourcePath}?${new URLSearchParams(directives)}`;
}

function getSingleParameter(parameters: URLSearchParams, name: string) {
  const values = parameters.getAll(name);
  if (values.length > 1) {
    throw new Error(
      `${contentImageVirtualModuleId} requires exactly one ${name} query parameter`,
    );
  }
  return values[0] || null;
}
