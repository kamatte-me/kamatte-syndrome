import type { Root } from 'mdast';
import { describe, expect, it } from 'vitest';
import { remarkImageLoadingLazy } from './index.ts';

function transform(tree: Root) {
  const transformer = remarkImageLoadingLazy();
  transformer(tree);
  return tree;
}

describe('remarkImageLoadingLazy', () => {
  it('adds lazy loading to Markdown images', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'image',
              alt: 'Example',
              url: '/media/example.png',
            },
          ],
        },
      ],
    });

    expect(tree).toMatchObject({
      children: [
        {
          children: [
            {
              data: {
                hProperties: {
                  loading: 'lazy',
                },
              },
            },
          ],
        },
      ],
    });
  });

  it('keeps explicit Markdown image loading values', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'image',
          alt: 'Hero',
          url: '/media/hero.png',
          data: {
            hProperties: {
              className: ['hero'],
              loading: 'eager',
            },
          },
        },
      ],
    });

    expect(tree).toMatchObject({
      children: [
        {
          data: {
            hProperties: {
              className: ['hero'],
              loading: 'eager',
            },
          },
        },
      ],
    });
  });

  it('adds lazy loading to MDX img elements', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'img',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'src',
              value: '/media/example.png',
            },
          ],
          children: [],
        },
      ],
    });

    expect(tree).toMatchObject({
      children: [
        {
          attributes: [
            {
              name: 'src',
              value: '/media/example.png',
            },
            {
              name: 'loading',
              value: 'lazy',
            },
          ],
        },
      ],
    });
  });

  it('keeps explicit MDX img loading attributes', () => {
    const tree = transform({
      type: 'root',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'img',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'loading',
              value: 'eager',
            },
          ],
          children: [],
        },
      ],
    });

    expect(tree).toMatchObject({
      children: [
        {
          attributes: [
            {
              name: 'loading',
              value: 'eager',
            },
          ],
        },
      ],
    });
  });
});
