import {
  type FeedItem,
  type FeedState,
  getPublishedAtTimestamp,
} from './model.ts';

export function findPendingItems(
  items: readonly FeedItem[],
  state: FeedState,
): readonly FeedItem[] {
  if (state.latestPublishedAt === null) {
    return items;
  }

  const latestTimestamp = Date.parse(state.latestPublishedAt);
  return items.filter(
    (item) => getPublishedAtTimestamp(item) > latestTimestamp,
  );
}
