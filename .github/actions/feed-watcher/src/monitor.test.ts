import { describe, expect, it } from 'vitest';
import type { FeedItem } from './model.ts';
import { findPendingItems } from './monitor.ts';
import { createFeedState } from './state.ts';

const item: FeedItem = {
  id: 'https://kamatte.me/blog/example',
  publishedAt: '2026-08-15T01:00:00.000Z',
  title: 'Example',
  url: 'https://kamatte.me/blog/example',
};

describe('findPendingItems', () => {
  it('returns only items newer than the saved published timestamp', () => {
    const renamedItem = {
      ...item,
      id: 'https://kamatte.me/blog/renamed',
      url: 'https://kamatte.me/blog/renamed',
    };
    const newerItem = {
      ...item,
      id: 'https://kamatte.me/blog/newer',
      publishedAt: '2026-08-16T01:00:00.000Z',
      url: 'https://kamatte.me/blog/newer',
    };
    const state = createFeedState(item.publishedAt);

    expect(findPendingItems([renamedItem, newerItem], state)).toEqual([
      newerItem,
    ]);
  });
});
