import { createHash } from 'node:crypto';
import path from 'node:path';
import { normalizePath } from 'vite';
import { imageSourceExtensions } from '../image/formats.ts';
import type { RequestedImageVariantWidth } from '../image/transform.ts';
import type { ImageVariantEntry } from '../types.ts';
import {
  assertKnownQueryParameters,
  getSingleQueryParameter,
} from './queryParameters.ts';

export const reactImageVirtualModuleId =
  'virtual:react-optimized-responsive-image';
const supportedImageExtensions = new Set<string>(imageSourceExtensions);

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

type CreateReactImageVirtualModuleOptions = Readonly<{
  image: ImageVariantEntry;
}>;

export function createReactImageVirtualModule({
  image,
}: CreateReactImageVirtualModuleOptions) {
  return createReactImageModuleCode([
    `const imageVariant=${JSON.stringify(image)};`,
  ]);
}

type CreateUnoptimizedReactImageVirtualModuleOptions =
  CreateReactImageVirtualModuleOptions;

export function createUnoptimizedReactImageVirtualModule({
  image,
}: CreateUnoptimizedReactImageVirtualModuleOptions) {
  return createReactImageModuleCode([
    `const imageVariant=${JSON.stringify({ ...image, avif: [], webp: [] })};`,
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
