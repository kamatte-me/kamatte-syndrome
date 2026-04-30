import { isOEmbedUrl } from '@kamatte-syndrome/oembed-resolver';
import type { Paragraph, Root, RootContent, Text } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

const standaloneUrlPattern = /^https?:\/\/[^\s<>"']+$/i;

export function remarkStandaloneUrlEmbed() {
  return (tree: Root) => {
    tree.children = tree.children.map((child): RootContent => {
      const url = getStandaloneParagraphUrl(child);
      return url ? createStandaloneUrlElement(url) : child;
    });
  };
}

function getStandaloneParagraphUrl(node: RootContent) {
  if (node.type !== 'paragraph' || node.children.length !== 1) {
    return undefined;
  }

  const [child] = node.children;
  if (!child || !isTextNode(child)) {
    return undefined;
  }

  const value = child.value.trim();
  return standaloneUrlPattern.test(value) ? value : undefined;
}

function createStandaloneUrlElement(url: string): MdxJsxFlowElement {
  return createUrlElement(isOEmbedUrl(url) ? 'OEmbed' : 'LinkCard', url);
}

function createUrlElement(
  name: 'LinkCard' | 'OEmbed',
  url: string,
): MdxJsxFlowElement {
  const urlAttribute: MdxJsxAttribute = {
    type: 'mdxJsxAttribute',
    name: 'url',
    value: url,
  };

  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: [urlAttribute],
    children: [],
  };
}

function isTextNode(node: Paragraph['children'][number]): node is Text {
  return node.type === 'text';
}
