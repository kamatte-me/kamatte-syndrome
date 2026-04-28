import providers from 'oembed-providers/providers.json';
import { normalizeOpenGraphUrl } from './openGraph';

type OEmbedProviderEndpoint = {
  schemes?: string[];
  url: string;
  discovery?: boolean;
  formats?: string[];
};

type OEmbedProvider = {
  provider_name: string;
  provider_url: string;
  endpoints?: OEmbedProviderEndpoint[];
};

export type OEmbedType = 'photo' | 'video' | 'link' | 'rich';

export type OEmbedMetadata = {
  url: string;
  type: OEmbedType;
  version: string;
  title?: string;
  authorName?: string;
  authorUrl?: string;
  providerName?: string;
  providerUrl?: string;
  cacheAge?: number;
  thumbnailUrl?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  html?: string;
  width?: number;
  height?: number;
  photoUrl?: string;
  fetchedAt: string;
};

export type OEmbedEndpointMatch = {
  providerName: string;
  providerUrl: string;
  endpointUrl: string;
};

type ProviderDefinition = OEmbedProvider;
type ProviderEndpoint = OEmbedProviderEndpoint;

const oEmbedProviders: OEmbedProvider[] = providers;

const compiledEndpoints = oEmbedProviders.flatMap((provider) =>
  (provider.endpoints ?? []).flatMap((endpoint) =>
    createEndpointMatchers(provider, endpoint),
  ),
);

export function isOEmbedUrl(url: string) {
  return Boolean(resolveOEmbedEndpoint(url));
}

export function resolveOEmbedEndpoint(url: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return undefined;
  }

  const href = parsedUrl.href;
  const match = compiledEndpoints.find(({ schemePattern }) =>
    schemePattern.test(href),
  );

  if (!match) {
    return undefined;
  }

  return {
    providerName: match.providerName,
    providerUrl: match.providerUrl,
    endpointUrl: match.endpointUrl,
  };
}

export function validateOEmbedRequest(input: unknown) {
  if (!isRecord(input) || typeof input.url !== 'string') {
    throw new Error('A URL is required.');
  }

  return {
    url: normalizeOpenGraphUrl(input.url),
  };
}

export function normalizeOEmbedResponse(
  input: unknown,
  sourceUrl: string,
  fetchedAt = new Date().toISOString(),
): OEmbedMetadata | undefined {
  if (!isRecord(input) || !isOEmbedType(input.type)) {
    return undefined;
  }

  const version = getOEmbedVersion(input.version);
  if (!version) {
    return undefined;
  }

  const metadata: OEmbedMetadata = {
    url: sourceUrl,
    type: input.type,
    version,
    title: getString(input.title),
    authorName: getString(input.author_name),
    authorUrl: getAbsoluteUrl(input.author_url, sourceUrl),
    providerName: getString(input.provider_name),
    providerUrl: getAbsoluteUrl(input.provider_url, sourceUrl),
    cacheAge: getPositiveNumber(input.cache_age),
    thumbnailUrl: getAbsoluteUrl(input.thumbnail_url, sourceUrl),
    thumbnailWidth: getPositiveNumber(input.thumbnail_width),
    thumbnailHeight: getPositiveNumber(input.thumbnail_height),
    html: getString(input.html),
    width: getPositiveNumber(input.width),
    height: getPositiveNumber(input.height),
    fetchedAt,
  };

  if (input.type === 'photo') {
    metadata.photoUrl = getAbsoluteUrl(input.url, sourceUrl);
  }

  if (!isRenderableOEmbed(metadata)) {
    return undefined;
  }

  return metadata;
}

export function createOEmbedRequestUrl(
  match: OEmbedEndpointMatch,
  url: string,
) {
  const usesFormatPlaceholder = match.endpointUrl.includes('{format}');
  const endpoint = new URL(match.endpointUrl.replace('{format}', 'json'));

  endpoint.searchParams.set('url', url);
  endpoint.searchParams.set('maxwidth', '720');

  if (!usesFormatPlaceholder) {
    endpoint.searchParams.set('format', 'json');
  }

  return endpoint.href;
}

export function getOEmbedCacheTtlSeconds(metadata: OEmbedMetadata) {
  const defaultTtlSeconds = 60 * 60 * 24 * 7;

  if (!metadata.cacheAge) {
    return defaultTtlSeconds;
  }

  return Math.min(metadata.cacheAge, defaultTtlSeconds);
}

export function isRenderableOEmbed(metadata: OEmbedMetadata) {
  if (
    (metadata.type === 'video' || metadata.type === 'rich') &&
    metadata.html
  ) {
    return true;
  }

  if (metadata.type === 'photo' && metadata.photoUrl) {
    return true;
  }

  return false;
}

function createEndpointMatchers(
  provider: ProviderDefinition,
  endpoint: ProviderEndpoint,
) {
  if (endpoint.formats && !endpoint.formats.includes('json')) {
    return [];
  }

  return (endpoint.schemes ?? [])
    .filter(
      (scheme) => scheme.startsWith('http://') || scheme.startsWith('https://'),
    )
    .map((scheme) => ({
      providerName: provider.provider_name,
      providerUrl: provider.provider_url,
      endpointUrl: endpoint.url,
      schemePattern: createSchemePattern(scheme),
    }));
}

function createSchemePattern(scheme: string) {
  const escapedParts = scheme.split('*').map(escapeRegExp);
  return new RegExp(`^${escapedParts.join('.*')}$`, 'i');
}

function escapeRegExp(value: string) {
  return value.replace(/[\\^$+?.()|[\]{}]/g, '\\$&');
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getPositiveNumber(value: unknown) {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) && number > 0
    ? number
    : undefined;
}

function getOEmbedVersion(value: unknown) {
  if (value === '1.0' || value === 1) {
    return '1.0';
  }

  return undefined;
}

function getAbsoluteUrl(value: unknown, baseUrl: string) {
  const stringValue = getString(value);
  if (!stringValue) {
    return undefined;
  }

  try {
    const url = new URL(stringValue, baseUrl);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function isOEmbedType(value: unknown): value is OEmbedType {
  return (
    value === 'photo' ||
    value === 'video' ||
    value === 'link' ||
    value === 'rich'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
