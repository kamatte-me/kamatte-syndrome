import type { Image, Root } from 'mdast';
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx';

type ImageData = Image['data'] & {
  hProperties?: Record<string, unknown>;
};

type MarkdownAstNode = {
  type?: unknown;
  children?: unknown;
  data?: ImageData;
  name?: unknown;
  attributes?: unknown;
};

export function remarkImageLoadingLazy() {
  return (tree: Root) => {
    addLazyLoadingToImages(tree);
  };
}

function addLazyLoadingToImages(node: unknown) {
  if (!isMarkdownAstNode(node)) {
    return;
  }

  if (node.type === 'image') {
    addLazyLoadingToMarkdownImage(node);
  }

  if (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    node.name === 'img'
  ) {
    addLazyLoadingToMdxImage(node);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      addLazyLoadingToImages(child);
    }
  }
}

function isMarkdownAstNode(node: unknown): node is MarkdownAstNode {
  return typeof node === 'object' && node !== null;
}

function addLazyLoadingToMarkdownImage(node: MarkdownAstNode) {
  node.data ??= {};
  node.data.hProperties = {
    ...node.data.hProperties,
    loading: node.data.hProperties?.loading ?? 'lazy',
  };
}

function addLazyLoadingToMdxImage(node: MarkdownAstNode) {
  const attributes = getMdxAttributes(node);

  if (attributes.some((attribute) => attribute.name === 'loading')) {
    return;
  }

  attributes.push({
    type: 'mdxJsxAttribute',
    name: 'loading',
    value: 'lazy',
  });
}

function getMdxAttributes(node: MarkdownAstNode): MdxJsxAttribute[] {
  if (!Array.isArray(node.attributes)) {
    node.attributes = [];
  }

  return node.attributes as MdxJsxAttribute[];
}
