import { satteriNewlineToBreak } from '@kamatte-syndrome/satteri-mdast-newline-to-break';
import { satteriMdxUrlEmbed } from '@kamatte-syndrome/satteri-mdast-url-embed';
import { describe, expect, it } from 'vitest';
import { compileSatteriMdx, type SatteriMdxOptions } from './index.ts';

const options = {
  features: { gfm: true, frontmatter: true },
  mdastPlugins: [satteriNewlineToBreak, satteriMdxUrlEmbed],
  jsxImportSource: 'react',
} satisfies SatteriMdxOptions;

async function compile(source: string) {
  return compileSatteriMdx(source, '/project/content/post.md', options);
}

describe('compileSatteriMdx', () => {
  it('extracts frontmatter without rendering it as content', async () => {
    const code = await compile('---\ntitle: Hello\n---\n\n# Body');

    expect(code).toContain('"Body"');
    expect(code).not.toContain('title: Hello');
  });

  it('keeps markdown files as MDX components with soft breaks', async () => {
    const code = await compile('Alpha\nBravo');

    expect(code).toContain('function MDXContent');
    expect(code).toContain('br: "br"');
    expect(code).toContain('_jsx(_components.br');
  });

  it('renders standalone URLs as MDX embed components', async () => {
    const code = await compile('https://example.com/posts/1');

    expect(code).toContain('const { LinkCard } = props.components || {};');
    expect(code).toContain('url: "https://example.com/posts/1"');
  });

  it('keeps explicit markdown URL links as links', async () => {
    const url = 'https://www.homepage-tukurikata.com/html/pre-code.html';
    const code = await compile(`[${url}](${url})`);

    expect(code).not.toContain('LinkCard');
    expect(code).not.toContain('OEmbed');
    expect(code).toContain(`href: "${url}"`);
  });

  it('preserves supported GFM table and strikethrough syntax', async () => {
    const code = await compile('| A | B |\n| - | - |\n| 1 | 2 |\n\n~~Gone~~');

    expect(code).toContain('table: "table"');
    expect(code).toContain('del: "del"');
    expect(code).toContain('"Gone"');
  });

  it('uses Sätteri GFM task list and single tilde behavior', async () => {
    const code = await compile('- [x] Done\n- [ ] Todo\n\nA ~literal~ word.');

    expect(code).toContain('input: "input"');
    expect(code).toContain('className: "contains-task-list"');
    expect(code).toContain('checked: true');
    expect(code).toContain('"Todo"');
    expect(code).toContain('del: "del"');
    expect(code).toContain('"literal"');
  });
});
