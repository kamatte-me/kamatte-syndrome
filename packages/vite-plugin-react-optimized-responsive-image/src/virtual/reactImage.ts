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
} from '../image/transform.ts';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

export const reactImageVirtualModuleId =
  'virtual:react-optimized-responsive-image';
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
  widths: readonly RequestedImageVariantWidth[];
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
      `${reactImageVirtualModuleId} widths must be positive integers or original: ${rawWidths}`,
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
    widths: [
      ...new Set(numericWidthTokens.map(Number).sort((a, b) => a - b)),
      ...(widthTokens.includes('original') ? (['original'] as const) : []),
    ],
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
      `${reactImageVirtualModuleId} src must be a supported image: ${src}`,
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
  'lossless' | 'sourcePath'
> &
  Readonly<{
    formatSettings?: ImageVariantFormatSettings;
    naturalHeight: number;
    naturalWidth: number;
    variantWidths: ImageVariantWidths;
  }>;

export function createReactImageVirtualModule({
  formatSettings = defaultImageVariantFormatSettings,
  lossless,
  naturalHeight,
  naturalWidth,
  sourcePath,
  variantWidths,
}: CreateReactImageVirtualModuleOptions) {
  const avifImport =
    lossless || variantWidths.avif.length === 0
      ? null
      : createImageTransformImport(sourcePath, {
          allowUpscale: 'true',
          as: 'metadata:src;width',
          ...createImageVariantFormatDirectives({
            format: 'avif',
            options: formatSettings.avif,
          }),
          w: variantWidths.avif.join(';'),
        });
  const webpImport =
    variantWidths.webp.length === 0
      ? null
      : createImageTransformImport(sourcePath, {
          allowUpscale: 'true',
          as: 'metadata:src;width',
          ...createImageVariantFormatDirectives({
            format: 'webp',
            lossless,
            options: formatSettings.webp,
          }),
          w: variantWidths.webp.join(';'),
        });

  return createReactImageModuleCode([
    `import imageVariantFallback from ${JSON.stringify(sourcePath)};`,
    ...(avifImport
      ? [`import imageVariantAvif from ${JSON.stringify(avifImport)};`]
      : []),
    ...(webpImport
      ? [`import imageVariantWebp from ${JSON.stringify(webpImport)};`]
      : []),
    'const toVariants=(value)=>Array.isArray(value)?value:[value];',
    `const imageVariant={avif:${avifImport ? 'toVariants(imageVariantAvif)' : '[]'},height:${naturalHeight},src:imageVariantFallback,webp:${webpImport ? 'toVariants(imageVariantWebp)' : '[]'},width:${naturalWidth}};`,
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
    `import { createReactImage } from ${JSON.stringify('@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react')};`,
    ...statements,
    'const ReactImage=createReactImage(imageVariant);',
    'export default ReactImage;',
  ].join('\n');
}
