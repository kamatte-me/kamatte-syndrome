import type { OEmbedMetadata } from './oEmbed';
import {
  createOEmbedRequestUrl,
  getOEmbedCacheTtlSeconds,
  normalizeOEmbedResponse,
  resolveOEmbedEndpoint,
} from './oEmbed';

type WorkersCacheStorage = CacheStorage & {
  readonly default: Cache;
};

const cacheNamespace = 'https://kamatte-syndrome.local/oembed/';
const fetchTimeoutMs = 8000;

export async function fetchOEmbedMetadata(url: string) {
  const cache = getWorkersCache();
  const cacheRequest = cache ? await createCacheRequest(url) : undefined;
  const cached =
    cache && cacheRequest ? await cache.match(cacheRequest) : undefined;

  if (cached) {
    return cached.json() as Promise<OEmbedMetadata>;
  }

  const metadata = await fetchAndParseOEmbedMetadata(url);

  if (cache && cacheRequest && metadata) {
    await cache.put(
      cacheRequest,
      new Response(JSON.stringify(metadata), {
        headers: {
          'Cache-Control': `public, max-age=${getOEmbedCacheTtlSeconds(metadata)}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }),
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
      headers: {
        Accept: 'application/json',
        'User-Agent': 'kamatte-syndrome-oembed-bot/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(fetchTimeoutMs),
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

function getWorkersCache() {
  return typeof caches === 'undefined'
    ? undefined
    : (caches as WorkersCacheStorage).default;
}

async function createCacheRequest(url: string) {
  return new Request(`${cacheNamespace}${await sha256(url)}`);
}

async function sha256(value: string) {
  const input = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isJsonContentType(contentType: string | null) {
  return contentType?.includes('application/json') ?? false;
}
