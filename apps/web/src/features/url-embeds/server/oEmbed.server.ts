import { resolveOEmbedEndpoint } from '@kamatte-syndrome/oembed-endpoint-resolver';
import {
  createOEmbedRequestUrl,
  normalizeOEmbedResponse,
} from '../utils/oEmbed';
import { normalizePublicHttpUrl } from '../utils/publicUrl';
import { googlebotUserAgent, serverFetchTimeoutMs } from './serverFetch';

const oEmbedFetchHeaders = {
  Accept: 'application/json',
  'User-Agent': googlebotUserAgent,
};

export async function fetchOEmbedMetadata(url: string) {
  const normalizedUrl = getSafeOEmbedUrl(url);
  if (!normalizedUrl) {
    return undefined;
  }

  return fetchAndParseOEmbedMetadata(normalizedUrl);
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
