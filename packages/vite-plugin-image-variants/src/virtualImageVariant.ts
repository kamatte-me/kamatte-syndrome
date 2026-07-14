import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import { clampImageWidths } from './clampImageWidths.ts';

export const imageVariantVirtualModuleId = 'virtual:image-variant';
const resolvedImageVariantVirtualModulePrefix =
  '\0virtual:image-variant:resolved:';
const supportedImageExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

export type ImageVariantVirtualModuleRequest = Readonly<{
  lossless: boolean;
  src: string;
  widths: readonly number[];
}>;

export type ResolvedImageVariantVirtualModule =
  ImageVariantVirtualModuleRequest &
    Readonly<{
      id: string;
      sourcePath: string;
    }>;

export function parseImageVariantVirtualModuleRequest(
  id: string,
): ImageVariantVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const moduleId = queryIndex === -1 ? id : id.slice(0, queryIndex);

  if (moduleId !== imageVariantVirtualModuleId || queryIndex === -1) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  const src = getSingleParameter(parameters, 'src');
  if (!src) {
    throw new Error(
      `${imageVariantVirtualModuleId} requires a src query, for example ` +
        `'${imageVariantVirtualModuleId}?src=./image.jpg&widths=160;320'`,
    );
  }
  if (/[?#]/.test(src)) {
    throw new Error(
      `${imageVariantVirtualModuleId} src must not contain ? or #: ${src}`,
    );
  }

  const rawWidths = getSingleParameter(parameters, 'widths');
  if (!rawWidths) {
    throw new Error(
      `${imageVariantVirtualModuleId} requires a widths query, for example ` +
        `'${imageVariantVirtualModuleId}?src=./image.jpg&widths=160;320'`,
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
      `${imageVariantVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  const rawLossless = getSingleParameter(parameters, 'lossless');
  if (rawLossless && rawLossless !== 'true' && rawLossless !== 'false') {
    throw new Error(
      `${imageVariantVirtualModuleId} lossless must be true or false: ${rawLossless}`,
    );
  }

  return {
    lossless: rawLossless === 'true',
    src,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveImageVariantVirtualModule({
  lossless,
  sourcePath,
  src,
  widths,
}: ImageVariantVirtualModuleRequest & { sourcePath: string }) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (!supportedImageExtensions.has(extension)) {
    throw new Error(
      `${imageVariantVirtualModuleId} src must be a supported static image: ${src}`,
    );
  }

  const normalizedSourcePath = normalizePath(sourcePath);
  const hash = createHash('sha256')
    .update(`${normalizedSourcePath}\0${widths.join(';')}\0${String(lossless)}`)
    .digest('hex');

  return {
    id: `${resolvedImageVariantVirtualModulePrefix}${hash}`,
    lossless,
    sourcePath: normalizedSourcePath,
    src,
    widths,
  } satisfies ResolvedImageVariantVirtualModule;
}

export function createImageVariantVirtualModule({
  lossless,
  naturalWidth,
  sourcePath,
  widths,
}: Pick<
  ResolvedImageVariantVirtualModule,
  'lossless' | 'sourcePath' | 'widths'
> &
  Readonly<{ naturalWidth: number }>) {
  const variantWidths = clampImageWidths(widths, naturalWidth);
  const fallbackImport = createImageImport(sourcePath, {
    as: 'metadata:src;width;height',
  });
  const avifImport = lossless
    ? null
    : createImageImport(sourcePath, {
        allowUpscale: 'true',
        as: 'metadata:src;width',
        format: 'avif',
        quality: '60',
        w: variantWidths.join(';'),
      });
  const webpImport = createImageImport(sourcePath, {
    allowUpscale: 'true',
    as: 'metadata:src;width',
    format: 'webp',
    ...(lossless ? { lossless: 'true' } : { quality: '80' }),
    w: variantWidths.join(';'),
  });

  return [
    `import imageVariantFallback from ${JSON.stringify(fallbackImport)};`,
    ...(avifImport
      ? [`import imageVariantAvif from ${JSON.stringify(avifImport)};`]
      : []),
    `import imageVariantWebp from ${JSON.stringify(webpImport)};`,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariant={avif:${avifImport ? 'toVariants(imageVariantAvif)' : '[]'},height:imageVariantFallback.height,src:imageVariantFallback.src,webp:toVariants(imageVariantWebp),width:imageVariantFallback.width};`,
    'export { imageVariant };',
    'export default imageVariant;',
  ].join('\n');
}

export function createUnoptimizedImageVariantVirtualModule({
  height,
  sourcePath,
  width,
}: Readonly<{ height: number; sourcePath: string; width: number }>) {
  return [
    `import imageVariantFallback from ${JSON.stringify(sourcePath)};`,
    `const imageVariant={avif:[],height:${height},src:imageVariantFallback,webp:[],width:${width}};`,
    'export { imageVariant };',
    'export default imageVariant;',
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
      `${imageVariantVirtualModuleId} requires exactly one ${name} query parameter`,
    );
  }
  return values[0] || null;
}
