import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import { clampImageWidths } from './clampImageWidths.ts';
import {
  createImageTransformImport,
  imageVariantAvifQuality,
  imageVariantWebpQuality,
} from './imageTransform.ts';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

export const reactImageVirtualModuleId = 'virtual:react-image';
const supportedImageExtensions = new Set([
  '.avif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
]);

export type ReactImageVirtualModuleRequest = Readonly<{
  lossless: boolean;
  src: string;
  widths: readonly number[];
}>;

export type ResolvedReactImageVirtualModule = ReactImageVirtualModuleRequest &
  Readonly<{
    id: string;
    sourcePath: string;
  }>;

export function parseReactImageVirtualModuleRequest(
  id: string,
): ReactImageVirtualModuleRequest | null {
  const queryIndex = id.indexOf('?');
  const requestModuleId = queryIndex === -1 ? id : id.slice(0, queryIndex);

  if (requestModuleId !== reactImageVirtualModuleId || queryIndex === -1) {
    return null;
  }

  const parameters = new URLSearchParams(id.slice(queryIndex + 1));
  assertKnownQueryParameters(
    parameters,
    ['src', 'widths', 'lossless'],
    reactImageVirtualModuleId,
  );
  const src = getSingleQueryParameter(
    parameters,
    'src',
    reactImageVirtualModuleId,
  );
  if (!src) {
    throw new Error(
      `${reactImageVirtualModuleId} requires a src query, for example ` +
        `'${reactImageVirtualModuleId}?src=./image.jpg&widths=160;320'`,
    );
  }
  if (/[?#]/.test(src)) {
    throw new Error(
      `${reactImageVirtualModuleId} src must not contain ? or #: ${src}`,
    );
  }

  const rawWidths = getSingleQueryParameter(
    parameters,
    'widths',
    reactImageVirtualModuleId,
  );
  if (!rawWidths) {
    throw new Error(
      `${reactImageVirtualModuleId} requires a widths query, for example ` +
        `'${reactImageVirtualModuleId}?src=./image.jpg&widths=160;320'`,
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
      `${reactImageVirtualModuleId} widths must be positive integers: ${rawWidths}`,
    );
  }

  const rawLossless = getSingleQueryParameter(
    parameters,
    'lossless',
    reactImageVirtualModuleId,
  );
  if (rawLossless && rawLossless !== 'true' && rawLossless !== 'false') {
    throw new Error(
      `${reactImageVirtualModuleId} lossless must be true or false: ${rawLossless}`,
    );
  }

  return {
    lossless: rawLossless === 'true',
    src,
    widths: [...new Set(widthTokens.map(Number))].sort((a, b) => a - b),
  };
}

export function resolveReactImageVirtualModule({
  lossless,
  sourcePath,
  src,
  widths,
}: ReactImageVirtualModuleRequest & { sourcePath: string }) {
  const extension = path.extname(sourcePath).toLowerCase();
  if (!supportedImageExtensions.has(extension)) {
    throw new Error(
      `${reactImageVirtualModuleId} src must be a supported static image: ${src}`,
    );
  }

  const normalizedSourcePath = normalizePath(sourcePath);
  const hash = createHash('sha256')
    .update(`${normalizedSourcePath}\0${widths.join(';')}\0${String(lossless)}`)
    .digest('hex');

  return {
    id: `\0${reactImageVirtualModuleId}:resolved:${hash}`,
    lossless,
    sourcePath: normalizedSourcePath,
    src,
    widths,
  } satisfies ResolvedReactImageVirtualModule;
}

type CreateReactImageVirtualModuleOptions = Pick<
  ResolvedReactImageVirtualModule,
  'lossless' | 'sourcePath' | 'widths'
> &
  Readonly<{ naturalHeight: number; naturalWidth: number }>;

export function createReactImageVirtualModule({
  lossless,
  naturalHeight,
  naturalWidth,
  sourcePath,
  widths,
}: CreateReactImageVirtualModuleOptions) {
  const variantWidths = clampImageWidths(widths, naturalWidth);
  const avifImport = lossless
    ? null
    : createImageTransformImport(sourcePath, {
        allowUpscale: 'true',
        as: 'metadata:src;width',
        format: 'avif',
        quality: String(imageVariantAvifQuality),
        w: variantWidths.join(';'),
      });
  const webpImport = createImageTransformImport(sourcePath, {
    allowUpscale: 'true',
    as: 'metadata:src;width',
    format: 'webp',
    ...(lossless
      ? { lossless: 'true' }
      : { quality: String(imageVariantWebpQuality) }),
    w: variantWidths.join(';'),
  });

  return createReactImageModuleCode([
    `import imageVariantFallback from ${JSON.stringify(sourcePath)};`,
    ...(avifImport
      ? [`import imageVariantAvif from ${JSON.stringify(avifImport)};`]
      : []),
    `import imageVariantWebp from ${JSON.stringify(webpImport)};`,
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariant={avif:${avifImport ? 'toVariants(imageVariantAvif)' : '[]'},height:${naturalHeight},src:imageVariantFallback,webp:toVariants(imageVariantWebp),width:${naturalWidth}};`,
  ]);
}

type CreateUnoptimizedReactImageVirtualModuleOptions = Readonly<{
  height: number;
  sourcePath: string;
  width: number;
}>;

export function createUnoptimizedReactImageVirtualModule({
  height,
  sourcePath,
  width,
}: CreateUnoptimizedReactImageVirtualModuleOptions) {
  return createReactImageModuleCode([
    `import imageVariantFallback from ${JSON.stringify(sourcePath)};`,
    `const imageVariant={avif:[],height:${height},src:imageVariantFallback,webp:[],width:${width}};`,
  ]);
}

function createReactImageModuleCode(statements: string[]) {
  return [
    `import { createReactImage } from ${JSON.stringify('@kamatte-syndrome/vite-plugin-image-variants/react')};`,
    ...statements,
    'const ReactImage=createReactImage(imageVariant);',
    'export { imageVariant as variant };',
    'export default ReactImage;',
  ].join('\n');
}
