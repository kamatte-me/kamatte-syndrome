import type {
  Delete,
  FootnoteDefinition,
  FootnoteReference,
  Link,
  Paragraph,
  Root,
  Table,
  Text,
} from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';
import { remarkGfmSubset } from './index.ts';

function parse(markdown: string): Root {
  return unified().use(remarkParse).use(remarkGfmSubset).parse(markdown);
}

function paragraph(tree: Root): Paragraph {
  const node = tree.children[0];
  expect(node?.type).toBe('paragraph');
  return node as Paragraph;
}

describe('remarkGfmSubset', () => {
  it('parses double-tilde strikethrough as delete nodes', () => {
    const tree = parse('A ~~deleted~~ word.');
    const deleteNode = paragraph(tree).children.find(
      (node): node is Delete => node.type === 'delete',
    );

    expect(deleteNode?.children[0]).toMatchObject({
      type: 'text',
      value: 'deleted',
    });
  });

  it('does not parse single-tilde strikethrough by default', () => {
    const tree = parse('A ~literal~ word.');
    const children = paragraph(tree).children;

    expect(children.some((node) => node.type === 'delete')).toBe(false);
    expect(
      children
        .filter((node): node is Text => node.type === 'text')
        .map((node) => node.value)
        .join(''),
    ).toBe('A ~literal~ word.');
  });

  it('parses footnote references and definitions', () => {
    const tree = parse('Alpha[^one].\n\n[^one]: Bravo');
    const footnoteReference = paragraph(tree).children.find(
      (node): node is FootnoteReference => node.type === 'footnoteReference',
    );
    const footnoteDefinition = tree.children.find(
      (node): node is FootnoteDefinition => node.type === 'footnoteDefinition',
    );

    expect(footnoteReference).toMatchObject({
      identifier: 'one',
      label: 'one',
    });
    expect(footnoteDefinition).toMatchObject({
      identifier: 'one',
      label: 'one',
    });
  });

  it('parses markdown tables as table nodes', () => {
    const tree = parse('| A | B |\n| - | - |\n| 1 | 2 |');
    const table = tree.children[0];

    expect(table?.type).toBe('table');
    expect((table as Table).children).toHaveLength(2);
  });

  it('keeps URL-only text as text instead of GFM autolink literals', () => {
    const tree = parse('https://example.com/posts/1');
    const children = paragraph(tree).children;

    expect(children).toHaveLength(1);
    expect(children[0]).toMatchObject({
      type: 'text',
      value: 'https://example.com/posts/1',
    });
  });

  it('keeps explicit markdown links as links', () => {
    const tree = parse('[https://example.com](https://example.com)');
    const children = paragraph(tree).children;

    expect(children[0]).toMatchObject({
      type: 'link',
      url: 'https://example.com',
    } satisfies Partial<Link>);
  });
});
