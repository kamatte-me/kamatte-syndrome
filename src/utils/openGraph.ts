import { normalizePublicHttpUrl } from './publicUrl';

export type OpenGraphRequest = {
  url: string;
};

export type OpenGraphMetadata = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  fetchedAt: string;
};

type OpenGraphFields = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
};

type MetaAttributes = {
  property?: string;
  name?: string;
  content?: string;
};

type LinkAttributes = {
  rel?: string;
  href?: string;
};

export function validateOpenGraphRequest(input: unknown): OpenGraphRequest {
  if (!isRecord(input) || typeof input.url !== 'string') {
    throw new Error('A URL is required.');
  }

  return {
    url: normalizePublicHttpUrl(input.url),
  };
}

export function parseOpenGraphHtml(
  html: string,
  url: string,
  fetchedAt = new Date().toISOString(),
): OpenGraphMetadata {
  const fields: OpenGraphFields = {};
  const fallbackTitle = extractTitle(html);

  for (const attributes of extractMetaAttributes(html)) {
    collectMetaAttributes(fields, attributes);
  }

  for (const attributes of extractLinkAttributes(html)) {
    collectLinkAttributes(fields, attributes);
  }

  return buildOpenGraphMetadata(fields, url, fetchedAt, fallbackTitle);
}

export function buildOpenGraphMetadata(
  fields: OpenGraphFields,
  url: string,
  fetchedAt = new Date().toISOString(),
  fallbackTitle?: string,
): OpenGraphMetadata {
  return {
    url,
    title: cleanText(fields.title) ?? cleanText(fallbackTitle),
    description: cleanText(fields.description),
    image: resolveMetadataUrl(fields.image, url),
    siteName: cleanText(fields.siteName),
    favicon: resolveMetadataUrl(fields.favicon, url),
    fetchedAt,
  };
}

export function collectMetaAttributes(
  fields: OpenGraphFields,
  attributes: MetaAttributes,
) {
  const key = (attributes.property ?? attributes.name)?.toLowerCase();
  const content = cleanText(attributes.content);

  if (!key || !content) {
    return;
  }

  if (key === 'og:title') {
    fields.title = content;
    return;
  }

  if (key === 'twitter:title') {
    fields.title ??= content;
    return;
  }

  if (key === 'og:description') {
    fields.description = content;
    return;
  }

  if (key === 'twitter:description') {
    fields.description ??= content;
    return;
  }

  if (key === 'description') {
    fields.description ??= content;
    return;
  }

  if (key === 'og:image') {
    fields.image = content;
    return;
  }

  if (key === 'twitter:image') {
    fields.image ??= content;
    return;
  }

  if (key === 'og:site_name') {
    fields.siteName ??= content;
  }
}

export function collectLinkAttributes(
  fields: OpenGraphFields,
  attributes: LinkAttributes,
) {
  const rel = attributes.rel?.toLowerCase();
  const href = cleanText(attributes.href);

  if (!rel || !href || fields.favicon) {
    return;
  }

  if (
    rel.split(/\s+/).some((value) => value === 'icon' || value === 'shortcut')
  ) {
    fields.favicon = href;
  }
}

function extractTitle(html: string) {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match?.[1] ? decodeHtml(match[1]) : undefined;
}

function extractMetaAttributes(html: string) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) =>
    parseAttributes<MetaAttributes>(match[0]),
  );
}

function extractLinkAttributes(html: string) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((match) =>
    parseAttributes<LinkAttributes>(match[0]),
  );
}

function parseAttributes<T extends Record<string, string | undefined>>(
  tag: string,
) {
  const attributes: Record<string, string> = {};
  const attributePattern =
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

  for (const match of tag.matchAll(attributePattern)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    if (name) {
      attributes[name.toLowerCase()] = decodeHtml(
        doubleQuoted ?? singleQuoted ?? unquoted ?? '',
      );
    }
  }

  return attributes as T;
}

function resolveMetadataUrl(value: string | undefined, baseUrl: string) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return undefined;
  }

  try {
    return new URL(cleaned, baseUrl).href;
  } catch {
    return undefined;
  }
}

function cleanText(value: string | undefined) {
  const cleaned = value?.replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

function decodeHtml(value: string) {
  return value.replace(
    /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (entity, name: string) => {
      const normalized = name.toLowerCase();
      if (normalized === 'amp') {
        return '&';
      }
      if (normalized === 'lt') {
        return '<';
      }
      if (normalized === 'gt') {
        return '>';
      }
      if (normalized === 'quot') {
        return '"';
      }
      if (normalized === 'apos') {
        return "'";
      }
      if (normalized.startsWith('#x')) {
        return decodeCodePoint(
          Number.parseInt(normalized.slice(2), 16),
          entity,
        );
      }
      if (normalized.startsWith('#')) {
        return decodeCodePoint(
          Number.parseInt(normalized.slice(1), 10),
          entity,
        );
      }
      return entity;
    },
  );
}

function decodeCodePoint(codePoint: number, fallback: string) {
  if (!Number.isFinite(codePoint)) {
    return fallback;
  }

  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
