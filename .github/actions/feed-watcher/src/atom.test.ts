import { describe, expect, it } from 'vitest';
import { parseAtomFeed } from './atom.ts';

describe('parseAtomFeed', () => {
  it('parses CDATA titles and orders entries from oldest to newest', () => {
    const items = parseAtomFeed(`<?xml version="1.0"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title type="html"><![CDATA[Second post]]></title>
          <id>https://kamatte.me/blog/second</id>
          <link href="https://kamatte.me/blog/second" />
          <published>2026-08-15T01:00:00.000Z</published>
        </entry>
        <entry>
          <title>First post</title>
          <id>https://kamatte.me/blog/first</id>
          <link href="https://kamatte.me/blog/first" />
          <published>2026-08-14T01:00:00.000Z</published>
        </entry>
      </feed>`);

    expect(items).toEqual([
      {
        id: 'https://kamatte.me/blog/first',
        publishedAt: '2026-08-14T01:00:00.000Z',
        title: 'First post',
        url: 'https://kamatte.me/blog/first',
      },
      {
        id: 'https://kamatte.me/blog/second',
        publishedAt: '2026-08-15T01:00:00.000Z',
        title: 'Second post',
        url: 'https://kamatte.me/blog/second',
      },
    ]);
  });

  it('uses the entry URL when the Atom id is absent', () => {
    const [item] = parseAtomFeed(`
      <feed xmlns="http://www.w3.org/2005/Atom">
        <entry>
          <title>Fallback</title>
          <link rel="alternate" href="https://kamatte.me/blog/fallback" />
          <published>2026-08-15T01:00:00.000Z</published>
        </entry>
      </feed>`);

    expect(item?.id).toBe('https://kamatte.me/blog/fallback');
  });

  it('rejects entries that have no published date', () => {
    expect(() =>
      parseAtomFeed(`
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Undated</title>
            <id>https://kamatte.me/blog/undated</id>
            <link href="https://kamatte.me/blog/undated" />
            <updated>2026-08-15T01:00:00.000Z</updated>
          </entry>
        </feed>`),
    ).toThrow('does not include a published date');
  });
});
