import type { Root } from 'mdast';
import { describe, expect, it, vi } from 'vitest';
import { remarkMdxUrlEmbed } from './index.ts';

vi.mock('@kamatte-syndrome/oembed-endpoint-resolver', () => ({
  resolveOEmbedEndpoint: (url: string) =>
    url === 'https://oembed.example/watch/1'
      ? {
          providerName: 'Mock Video',
          providerUrl: 'https://oembed.example',
          endpointUrl: 'https://oembed.example/oembed',
        }
      : undefined,
}));

function transform(tree: Root) {
  const transformer = remarkMdxUrlEmbed();
  transformer(tree);
  return tree;
}

describe('remarkMdxUrlEmbed', () => {
  it('converts an oEmbed URL paragraph into an OEmbed MDX element', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'https://oembed.example/watch/1',
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
          value: 'https://oembed.example/watch/1',
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

  it('trims standalone URL text before converting it', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: '  https://example.com/posts/2  ' },
          ],
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
          value: 'https://example.com/posts/2',
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

  it('does not convert non-HTTP or invalid URL text', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'ftp://example.com/file.zip' }],
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'https://' }],
        },
        {
          type: 'paragraph',
          children: [{ type: 'text', value: 'https://example.com/a b' }],
        },
      ],
    });

    expect(tree.children?.[0]?.type).toBe('paragraph');
    expect(tree.children?.[1]?.type).toBe('paragraph');
    expect(tree.children?.[2]?.type).toBe('paragraph');
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
