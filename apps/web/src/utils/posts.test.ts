import { describe, expect, it } from 'vitest';
import {
  createPostDescription,
  formatPostDate,
  paginateItems,
  parseBlogPageSearchParam,
} from './posts';

describe('posts helpers', () => {
  it('creates a plain-text description from the first 100 characters', () => {
    const content = `## Heading

This is **strong** and [linked](https://example.com). ${'a'.repeat(100)}`;

    const description = createPostDescription(content);

    expect(description).toHaveLength(100);
    expect(description).toBe(
      `Heading This is strong and linked. ${'a'.repeat(64)}…`,
    );
  });

  it('formats post dates as YYYY/M/D in Japan time', () => {
    expect(formatPostDate(new Date('2026-07-03T10:00:00+09:00'))).toBe(
      '2026/7/3',
    );
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
