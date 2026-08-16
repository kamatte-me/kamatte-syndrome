import { XMLParser } from 'fast-xml-parser';
import { type FeedItem, getPublishedAtTimestamp } from './model.ts';

type XmlRecord = Record<string, unknown>;

const parser = new XMLParser({
  attributeNamePrefix: '',
  cdataPropName: '#cdata',
  ignoreAttributes: false,
  textNodeName: '#text',
  trimValues: true,
});

export function parseAtomFeed(xml: string): readonly FeedItem[] {
  const parsed = parser.parse(xml);
  const feed = asRecord(parsed.feed);

  if (!feed) {
    throw new Error('The response is not an Atom feed.');
  }

  return asArray(feed.entry).map(parseAtomEntry).sort(compareFeedItems);
}

function parseAtomEntry(value: unknown): FeedItem {
  const entry = asRecord(value);

  if (!entry) {
    throw new Error('The Atom feed contains an invalid entry.');
  }

  const url = findEntryUrl(entry);
  const id = textValue(entry.id) ?? url;
  const publishedAt = textValue(entry.published);
  const title = textValue(entry.title);

  if (!id) {
    throw new Error('An Atom entry must include an id or link.');
  }

  if (!title) {
    throw new Error(`The Atom entry ${id} does not include a title.`);
  }

  if (!publishedAt) {
    throw new Error(`The Atom entry ${id} does not include a published date.`);
  }

  if (!url) {
    throw new Error(`The Atom entry ${id} does not include a link.`);
  }

  const item = {
    id,
    publishedAt,
    title,
    url,
  };

  getPublishedAtTimestamp(item);
  return item;
}

function findEntryUrl(entry: XmlRecord): string | null {
  const links = asArray(entry.link)
    .map(asRecord)
    .filter((link): link is XmlRecord => link !== null)
    .map((link) => ({
      href: textValue(link.href),
      rel: textValue(link.rel),
    }))
    .filter(
      (link): link is { href: string; rel: string | null } =>
        link.href !== null,
    );

  return (
    links.find((link) => link.rel === 'alternate')?.href ??
    links[0]?.href ??
    null
  );
}

function textValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  const record = asRecord(value);

  if (!record) {
    return null;
  }

  return textValue(record['#cdata']) ?? textValue(record['#text']);
}

function asArray(value: unknown): readonly unknown[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function asRecord(value: unknown): XmlRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  return value as XmlRecord;
}

function compareFeedItems(left: FeedItem, right: FeedItem): number {
  const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : Number.NaN;
  const rightTime = right.publishedAt
    ? Date.parse(right.publishedAt)
    : Number.NaN;

  if (
    Number.isFinite(leftTime) &&
    Number.isFinite(rightTime) &&
    leftTime !== rightTime
  ) {
    return leftTime - rightTime;
  }

  return left.id.localeCompare(right.id);
}
