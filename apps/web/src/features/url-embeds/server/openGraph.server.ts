import {
  googlebotUserAgent,
  serverFetchTimeoutMs,
} from '../constants/serverFetch';
import { buildOpenGraphMetadata, parseOpenGraphHtml } from '../utils/openGraph';
import { normalizePublicHttpUrl } from '../utils/publicUrl';

const maxRedirects = 5;
const openGraphFetchHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
  'User-Agent': googlebotUserAgent,
};

export async function fetchOpenGraphMetadata(url: string) {
  const fetchedAt = new Date().toISOString();
  const { response, finalUrl } = await fetchWithValidatedRedirects(url);
  const contentType = response.headers.get('content-type') ?? '';

  if (!response.ok) {
    throw new Error(`Open Graph request failed with ${response.status}.`);
  }

  if (!isHtmlContentType(contentType)) {
    return buildOpenGraphMetadata({}, url, fetchedAt);
  }

  return parseOpenGraphHtml(await response.text(), url, fetchedAt, finalUrl);
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
      return { response, finalUrl: currentUrl };
    }

    const location = response.headers.get('location');
    if (!location) {
      return { response, finalUrl: currentUrl };
    }

    currentUrl = normalizePublicHttpUrl(new URL(location, currentUrl).href);
  }

  throw new Error('Too many redirects.');
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
