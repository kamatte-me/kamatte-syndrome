import { resolveOEmbedEndpoint } from '@kamatte-syndrome/oembed-endpoint-resolver';
import type { Paragraph, Root, RootContent, Text } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement } from 'mdast-util-mdx-jsx';

const invalidStandaloneUrlCharacters = /[\s<>"']/;

type UrlEmbedElementName = 'LinkCard' | 'OEmbed';

export function remarkMdxUrlEmbed() {
  return (tree: Root) => {
    tree.children = tree.children.map((child): RootContent => {
      const url = getStandaloneParagraphUrl(child);
      return url ? createStandaloneUrlElement(url) : child;
    });
  };
}

function getStandaloneParagraphUrl(node: RootContent): string | undefined {
  if (node.type !== 'paragraph' || node.children.length !== 1) {
    return undefined;
  }

  const [child] = node.children;
  if (!child || !isTextNode(child)) {
    return undefined;
  }

  const value = child.value.trim();
  return isStandaloneHttpUrl(value) ? value : undefined;
}

function createStandaloneUrlElement(url: string): MdxJsxFlowElement {
  const elementName = resolveOEmbedEndpoint(url) ? 'OEmbed' : 'LinkCard';
  return createUrlElement(elementName, url);
}

function createUrlElement(
  name: UrlEmbedElementName,
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

function isStandaloneHttpUrl(value: string) {
  if (invalidStandaloneUrlCharacters.test(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0
    );
  } catch {
    return false;
  }
}
