import {
  buildOpenGraphMetadata,
  collectLinkAttributes,
  collectMetaAttributes,
  type OpenGraphMetadata,
  parseOpenGraphHtml,
} from './openGraph';

type WorkersCacheStorage = CacheStorage & {
  readonly default: Cache;
};

const cacheTtlSeconds = 60 * 60 * 24 * 7;
const cacheNamespace = 'https://kamatte-syndrome.local/open-graph/';
const fetchTimeoutMs = 8000;

export async function fetchOpenGraphMetadata(url: string) {
  const cache = getWorkersCache();
  const cacheRequest = cache ? await createCacheRequest(url) : undefined;
  const cached =
    cache && cacheRequest ? await cache.match(cacheRequest) : undefined;

  if (cached) {
    return cached.json() as Promise<OpenGraphMetadata>;
  }

  const metadata = await fetchAndParseOpenGraphMetadata(url);

  if (cache && cacheRequest && isCacheableMetadata(metadata)) {
    await cache.put(
      cacheRequest,
      new Response(JSON.stringify(metadata), {
        headers: {
          'Cache-Control': `public, max-age=${cacheTtlSeconds}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }),
    );
  }

  return metadata;
}

async function fetchAndParseOpenGraphMetadata(url: string) {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'kamatte-syndrome-ogp-bot/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });

    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !isHtmlContentType(contentType)) {
      return buildOpenGraphMetadata({}, url, fetchedAt);
    }

    return parseOpenGraphResponse(response, url, fetchedAt);
  } catch {
    return buildOpenGraphMetadata({}, url, fetchedAt);
  }
}

async function parseOpenGraphResponse(
  response: Response,
  url: string,
  fetchedAt: string,
) {
  const HtmlRewriter = getHtmlRewriter();
  if (!HtmlRewriter) {
    return parseOpenGraphHtml(await response.text(), url, fetchedAt);
  }

  const fields: Parameters<typeof buildOpenGraphMetadata>[0] = {};
  let title = '';

  await new HtmlRewriter()
    .on('title', {
      text(text) {
        title += text.text;
      },
    })
    .on('meta', {
      element(element) {
        collectMetaAttributes(fields, {
          property: element.getAttribute('property') ?? undefined,
          name: element.getAttribute('name') ?? undefined,
          content: element.getAttribute('content') ?? undefined,
        });
      },
    })
    .on('link', {
      element(element) {
        collectLinkAttributes(fields, {
          rel: element.getAttribute('rel') ?? undefined,
          href: element.getAttribute('href') ?? undefined,
        });
      },
    })
    .transform(response)
    .text();

  return buildOpenGraphMetadata(fields, url, fetchedAt, title);
}

function getHtmlRewriter() {
  return typeof HTMLRewriter === 'undefined' ? undefined : HTMLRewriter;
}

function isCacheableMetadata(metadata: OpenGraphMetadata) {
  return Boolean(
    metadata.title ||
      metadata.description ||
      metadata.image ||
      metadata.siteName ||
      metadata.favicon,
  );
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

function isHtmlContentType(contentType: string) {
  return (
    contentType.includes('text/html') ||
    contentType.includes('application/xhtml+xml')
  );
}
