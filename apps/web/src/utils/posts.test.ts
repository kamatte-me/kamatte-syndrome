import { describe, expect, it } from 'vitest';
import {
  paginateItems,
  parseBlogPageSearchParam,
  sortPostsByPublishedAtDesc,
} from './posts';

describe('posts helpers', () => {
  it('sorts newer posts first and leaves missing dates last', () => {
    const posts = sortPostsByPublishedAtDesc([
      { publishedAt: undefined, title: 'missing' },
      { publishedAt: new Date('2024-01-01T00:00:00+09:00'), title: 'older' },
      { publishedAt: new Date('2025-01-01T00:00:00+09:00'), title: 'newer' },
    ]);

    expect(posts.map((post) => post.title)).toEqual([
      'newer',
      'older',
      'missing',
    ]);
  });

  it('paginates 26 items into 6 pages with 5 items per page', () => {
    const items = Array.from({ length: 26 }, (_, index) => index + 1);

    const { pageInfo } = paginateItems(items, 1);

    expect(pageInfo).toEqual({
      totalItems: 26,
      totalPages: 6,
      currentPage: 1,
      perPage: 5,
    });
  });

  it('slices items for the first, middle, and final pages', () => {
    const items = Array.from({ length: 26 }, (_, index) => index + 1);

    expect(paginateItems(items, 1).items).toEqual([1, 2, 3, 4, 5]);
    expect(paginateItems(items, 3).items).toEqual([11, 12, 13, 14, 15]);
    expect(paginateItems(items, 6).items).toEqual([26]);
  });

  it('rejects invalid blog page search params', () => {
    expect(parseBlogPageSearchParam(undefined)).toBeUndefined();
    expect(parseBlogPageSearchParam('foo')).toBeUndefined();
    expect(parseBlogPageSearchParam('2.5')).toBeUndefined();
    expect(parseBlogPageSearchParam(2.5)).toBeUndefined();
    expect(parseBlogPageSearchParam('1')).toBeUndefined();
    expect(parseBlogPageSearchParam(1)).toBeUndefined();
    expect(parseBlogPageSearchParam('0')).toBeUndefined();
    expect(parseBlogPageSearchParam('-1')).toBeUndefined();
  });

  it('accepts blog page search params from page 2 onward', () => {
    expect(parseBlogPageSearchParam('2')).toBe(2);
    expect(parseBlogPageSearchParam(2)).toBe(2);
    expect(parseBlogPageSearchParam('12')).toBe(12);
  });
});
