import type { Paragraph, Text } from 'mdast';
import { newlineToBreak } from 'mdast-util-newline-to-break';
import { defineMdastPlugin } from 'satteri';

export const satteriNewlineToBreak = defineMdastPlugin({
  name: 'satteri-mdast-newline-to-break',
  text(node, context) {
    const children = createBreakNodes(node);

    if (children) {
      context.replaceNode(node, children);
    }
  },
});

function createBreakNodes(node: Readonly<Text>) {
  const text = { ...node };
  const paragraph: Paragraph = {
    type: 'paragraph',
    children: [text],
  };

  newlineToBreak(paragraph);

  return paragraph.children.length === 1 && paragraph.children[0] === text
    ? undefined
    : paragraph.children;
}
