type WorkersCacheStorage = CacheStorage & {
  readonly default: Cache;
};

type JsonCacheEntry = {
  cache?: Cache;
  request?: Request;
};

export function getWorkersCache() {
  return typeof caches === 'undefined'
    ? undefined
    : (caches as WorkersCacheStorage).default;
}

export async function matchJsonCache<T>(keyPrefix: string, key: string) {
  const cache = getWorkersCache();
  const request = cache
    ? await createHashCacheRequest(keyPrefix, key)
    : undefined;
  const cached = cache && request ? await cache.match(request) : undefined;

  return {
    cache,
    request,
    value: cached ? ((await cached.json()) as T) : undefined,
  };
}

export async function putJsonCache(
  entry: JsonCacheEntry,
  value: unknown,
  maxAgeSeconds: number,
) {
  if (!entry.cache || !entry.request) {
    return;
  }

  await entry.cache.put(
    entry.request,
    createJsonCacheResponse(value, maxAgeSeconds),
  );
}

async function createHashCacheRequest(keyPrefix: string, key: string) {
  return new Request(`${keyPrefix}${await sha256(key)}`);
}

function createJsonCacheResponse(value: unknown, maxAgeSeconds: number) {
  return new Response(JSON.stringify(value), {
    headers: {
      'Cache-Control': `public, max-age=${maxAgeSeconds}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

async function sha256(value: string) {
  const input = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
