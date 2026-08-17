export type FeedItem = Readonly<{
  id: string;
  publishedAt: string;
  title: string;
  url: string;
}>;

export type FeedState = Readonly<{
  latestPublishedAt: string | null;
  version: 1;
}>;

export function getPublishedAtTimestamp(item: FeedItem): number {
  const timestamp = Date.parse(item.publishedAt);

  if (!Number.isFinite(timestamp)) {
    throw new Error(`The Atom entry ${item.id} has an invalid published date.`);
  }

  return timestamp;
}
