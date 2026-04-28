import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';
import { remarkStandaloneUrlEmbed } from './remarkStandaloneUrlEmbed';

function transform(tree: Root) {
  const transformer = remarkStandaloneUrlEmbed();
  transformer(tree);
  return tree;
}

describe('remarkStandaloneUrlEmbed', () => {
  it('converts an oEmbed URL paragraph into an OEmbed MDX element', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'https://www.youtube.com/watch?v=GTjO6EuUcbY',
            },
          ],
        },
      ],
    });

    expect(tree.children?.[0]).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'OEmbed',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'url',
          value: 'https://www.youtube.com/watch?v=GTjO6EuUcbY',
        },
      ],
    });
  });

  it('converts a non-oEmbed standalone URL paragraph into a LinkCard MDX element', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'https://example.com/posts/1' }],
        },
      ],
    });

    expect(tree.children?.[0]).toMatchObject({
      type: 'mdxJsxFlowElement',
      name: 'LinkCard',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'url',
          value: 'https://example.com/posts/1',
        },
      ],
    });
  });

  it('does not convert regular markdown links or mixed text', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'See ' },
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ type: 'text', value: 'example' }],
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: 'https://example.com and some text' },
          ],
        },
      ],
    });

    expect(tree.children?.[0]?.type).toBe('paragraph');
    expect(tree.children?.[1]?.type).toBe('paragraph');
  });

  it('does not convert URLs nested in blockquotes or lists', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: 'https://example.com' }],
            },
          ],
        },
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: 'https://example.net' }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(tree.children?.[0]?.type).toBe('blockquote');
    expect(tree.children?.[1]?.type).toBe('list');
  });
});
