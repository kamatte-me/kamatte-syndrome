import { describe, expect, it } from 'vitest';
import {
  createPostExcerpt,
  sortPostsByPublishedAtDesc,
  toPostSlug,
} from './posts';

describe('posts helpers', () => {
  it('keeps the meta path as the slug', () => {
    expect(toPostSlug('hello-kamatte')).toBe('hello-kamatte');
  });

  it('extracts the first readable paragraph as the excerpt', () => {
    const content = `
# Title

![hero](/hero.png)

はじめまして。かまってっていいます。

二つ目の段落です。
`;

    expect(createPostExcerpt(content)).toBe(
      'はじめまして。かまってっていいます。',
    );
  });

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
});
