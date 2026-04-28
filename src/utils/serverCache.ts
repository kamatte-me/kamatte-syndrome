type WorkersCacheStorage = CacheStorage & {
  readonly default: Cache;
};

export function getWorkersCache() {
  return typeof caches === 'undefined'
    ? undefined
    : (caches as WorkersCacheStorage).default;
}

export async function createHashCacheRequest(keyPrefix: string, key: string) {
  return new Request(`${keyPrefix}${await sha256(key)}`);
}

export function createJsonCacheResponse(value: unknown, maxAgeSeconds: number) {
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
