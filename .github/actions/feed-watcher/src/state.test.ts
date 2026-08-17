import { describe, expect, it } from 'vitest';
import type { FeedItem } from './model.ts';
import {
  advanceLatestPublishedAt,
  createInitializedFeedState,
} from './state.ts';

const olderItem: FeedItem = {
  id: 'https://kamatte.me/blog/example',
  publishedAt: '2026-08-15T01:00:00.000Z',
  title: 'Example',
  url: 'https://kamatte.me/blog/example',
};

const newerItem: FeedItem = {
  ...olderItem,
  id: 'https://kamatte.me/blog/newer',
  publishedAt: '2026-08-16T01:00:00.000Z',
  url: 'https://kamatte.me/blog/newer',
};

describe('RSS publication state', () => {
  it('records only the latest published timestamp', () => {
    expect(createInitializedFeedState([olderItem, newerItem])).toEqual({
      latestPublishedAt: '2026-08-16T01:00:00.000Z',
      version: 1,
    });
  });

  it('only advances the saved timestamp', () => {
    expect(
      advanceLatestPublishedAt(
        { latestPublishedAt: newerItem.publishedAt, version: 1 },
        [olderItem],
      ),
    ).toEqual({
      latestPublishedAt: newerItem.publishedAt,
      version: 1,
    });
  });
});
