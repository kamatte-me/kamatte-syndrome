import {
  buildOpenGraphMetadata,
  collectLinkAttributes,
  collectMetaAttributes,
  type OpenGraphMetadata,
  parseOpenGraphHtml,
} from './openGraph';
import { normalizePublicHttpUrl } from './publicUrl';
import {
  createHashCacheRequest,
  createJsonCacheResponse,
  getWorkersCache,
} from './serverCache';
import { googlebotUserAgent, serverFetchTimeoutMs } from './serverFetch';

const cacheTtlSeconds = 60 * 60 * 24 * 7;
const cacheKeyPrefix = 'https://kamatte.me/__cache/open-graph/';
const maxRedirects = 5;
const openGraphFetchHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
  'User-Agent': googlebotUserAgent,
};

export async function fetchOpenGraphMetadata(url: string) {
  const cache = getWorkersCache();
  const cacheRequest = cache
    ? await createHashCacheRequest(cacheKeyPrefix, url)
    : undefined;
  const cached =
    cache && cacheRequest ? await cache.match(cacheRequest) : undefined;

  if (cached) {
    return cached.json() as Promise<OpenGraphMetadata>;
  }

  const metadata = await fetchAndParseOpenGraphMetadata(url);

  if (cache && cacheRequest && isCacheableMetadata(metadata)) {
    await cache.put(
      cacheRequest,
      createJsonCacheResponse(metadata, cacheTtlSeconds),
    );
  }

  return metadata;
}

async function fetchAndParseOpenGraphMetadata(url: string) {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetchWithValidatedRedirects(url);

    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !isHtmlContentType(contentType)) {
      return buildOpenGraphMetadata({}, url, fetchedAt);
    }

    return parseOpenGraphResponse(response, url, fetchedAt);
  } catch {
    return buildOpenGraphMetadata({}, url, fetchedAt);
  }
}

async function fetchWithValidatedRedirects(url: string) {
  let currentUrl = normalizePublicHttpUrl(url);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const response = await fetch(currentUrl, {
      headers: openGraphFetchHeaders,
      redirect: 'manual',
      signal: AbortSignal.timeout(serverFetchTimeoutMs),
    });

    if (!isRedirectResponse(response)) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) {
      return response;
    }

    currentUrl = normalizePublicHttpUrl(new URL(location, currentUrl).href);
  }

  throw new Error('Too many redirects.');
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

function isHtmlContentType(contentType: string) {
  return (
    contentType.includes('text/html') ||
    contentType.includes('application/xhtml+xml')
  );
}

function isRedirectResponse(response: Response) {
  return response.status >= 300 && response.status < 400;
}
