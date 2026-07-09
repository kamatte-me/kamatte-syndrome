import { resolveOEmbedEndpoint } from '@kamatte-syndrome/oembed-endpoint-resolver';
import type { Link, Paragraph } from 'mdast';
import {
  defineMdastPlugin,
  type MdxJsxFlowElement,
  type Position,
} from 'satteri';

const invalidStandaloneUrlCharacters = /[\s<>"']/;

type UrlEmbedElementName = 'LinkCard' | 'OEmbed';
type PositionedNode = {
  position?: Position | undefined;
};

export const satteriMdxUrlEmbed = defineMdastPlugin({
  name: 'satteri-mdx-url-embed',
  options: { position: true },
  paragraph(node, context) {
    if (context.parent(node)?.type !== 'root') {
      return;
    }

    const url = getStandaloneParagraphUrl(node, context.source);

    if (!url) {
      return;
    }

    context.replaceNode(node, createStandaloneUrlElement(url));
  },
});

function getStandaloneParagraphUrl(
  node: Readonly<Paragraph>,
  source: string,
): string | undefined {
  if (node.children.length !== 1) {
    return undefined;
  }

  const [child] = node.children;

  if (!child) {
    return undefined;
  }

  if (child.type === 'text') {
    const value = child.value.trim();
    return isStandaloneHttpUrl(value) ? value : undefined;
  }

  if (child.type === 'link') {
    return getStandaloneAutolinkUrl(child, source);
  }

  return undefined;
}

function getStandaloneAutolinkUrl(
  node: Readonly<Link>,
  source: string,
): string | undefined {
  if (getNodeSource(source, node) !== node.url) {
    return undefined;
  }

  if (node.title || node.children.length !== 1) {
    return undefined;
  }

  const [child] = node.children;

  if (child?.type !== 'text' || child.value !== node.url) {
    return undefined;
  }

  return isStandaloneHttpUrl(node.url) ? node.url : undefined;
}

function getNodeSource(source: string, node: Readonly<PositionedNode>) {
  const startOffset = node.position?.start.offset;
  const endOffset = node.position?.end.offset;

  if (typeof startOffset !== 'number' || typeof endOffset !== 'number') {
    return undefined;
  }

  return source.slice(startOffset, endOffset);
}

function createStandaloneUrlElement(url: string): MdxJsxFlowElement {
  const elementName = resolveOEmbedEndpoint(url) ? 'OEmbed' : 'LinkCard';
  return createUrlElement(elementName, url);
}

function createUrlElement(
  name: UrlEmbedElementName,
  url: string,
): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'url',
        value: url,
      },
    ],
    children: [],
  };
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
