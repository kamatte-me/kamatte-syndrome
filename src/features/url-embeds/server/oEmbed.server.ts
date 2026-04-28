import {
  createOEmbedRequestUrl,
  getOEmbedCacheTtlSeconds,
  normalizeOEmbedResponse,
  type OEmbedMetadata,
} from '../utils/oEmbed';
import { resolveOEmbedEndpoint } from '../utils/oEmbedProviders';
import { normalizePublicHttpUrl } from '../utils/publicUrl';
import { matchJsonCache, putJsonCache } from './serverCache';
import { googlebotUserAgent, serverFetchTimeoutMs } from './serverFetch';

const cacheKeyPrefix = 'https://kamatte.me/__cache/oembed/';
const oEmbedFetchHeaders = {
  Accept: 'application/json',
  'User-Agent': googlebotUserAgent,
};

export async function fetchOEmbedMetadata(url: string) {
  const normalizedUrl = getSafeOEmbedUrl(url);
  if (!normalizedUrl) {
    return undefined;
  }

  const cached = await matchJsonCache<OEmbedMetadata>(
    cacheKeyPrefix,
    normalizedUrl,
  );

  if (cached.value) {
    return cached.value;
  }

  const metadata = await fetchAndParseOEmbedMetadata(normalizedUrl);

  if (metadata) {
    await putJsonCache(cached, metadata, getOEmbedCacheTtlSeconds(metadata));
  }

  return metadata;
}

function getSafeOEmbedUrl(url: string) {
  try {
    return normalizePublicHttpUrl(url);
  } catch {
    return undefined;
  }
}

async function fetchAndParseOEmbedMetadata(url: string) {
  const endpoint = resolveOEmbedEndpoint(url);
  if (!endpoint) {
    return undefined;
  }

  try {
    const response = await fetch(createOEmbedRequestUrl(endpoint, url), {
      headers: oEmbedFetchHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(serverFetchTimeoutMs),
    });

    if (
      !response.ok ||
      !isJsonContentType(response.headers.get('content-type'))
    ) {
      return undefined;
    }

    return normalizeOEmbedResponse(await response.json(), url);
  } catch {
    return undefined;
  }
}

function isJsonContentType(contentType: string | null) {
  return contentType?.includes('application/json') ?? false;
}
