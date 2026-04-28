import type { OEmbedMetadata } from './oEmbed';
import {
  createOEmbedRequestUrl,
  getOEmbedCacheTtlSeconds,
  normalizeOEmbedResponse,
} from './oEmbed';
import { resolveOEmbedEndpoint } from './oEmbedProviders';
import {
  createHashCacheRequest,
  createJsonCacheResponse,
  getWorkersCache,
} from './serverCache';
import { googlebotUserAgent, serverFetchTimeoutMs } from './serverFetch';

const cacheKeyPrefix = 'https://kamatte.me/__cache/oembed/';
const oEmbedFetchHeaders = {
  Accept: 'application/json',
  'User-Agent': googlebotUserAgent,
};

export async function fetchOEmbedMetadata(url: string) {
  const cache = getWorkersCache();
  const cacheRequest = cache
    ? await createHashCacheRequest(cacheKeyPrefix, url)
    : undefined;
  const cached =
    cache && cacheRequest ? await cache.match(cacheRequest) : undefined;

  if (cached) {
    return cached.json() as Promise<OEmbedMetadata>;
  }

  const metadata = await fetchAndParseOEmbedMetadata(url);

  if (cache && cacheRequest && metadata) {
    await cache.put(
      cacheRequest,
      createJsonCacheResponse(metadata, getOEmbedCacheTtlSeconds(metadata)),
    );
  }

  return metadata;
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
