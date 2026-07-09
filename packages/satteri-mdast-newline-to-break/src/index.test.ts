import { mdxToJs } from 'satteri';
import { describe, expect, it } from 'vitest';
import { satteriNewlineToBreak } from './index.ts';

async function compile(source: string) {
  const result = await mdxToJs(source, {
    features: { gfm: true, frontmatter: true },
    mdastPlugins: [satteriNewlineToBreak],
    jsxImportSource: 'react',
  });

  return result.code;
}

describe('satteriNewlineToBreak', () => {
  it('turns soft line breaks into mdast break nodes', async () => {
    const code = await compile('Alpha\nBravo');

    expect(code).toContain('br: "br"');
    expect(code).toContain('_jsx(_components.br');
    expect(code).toContain('"Alpha"');
    expect(code).toContain('"Bravo"');
  });

  it.each([
    ['emphasis', 'Alpha *nested\nbreak*'],
    ['link', '[link\nlabel](https://example.com)'],
  ])(
    'turns soft line breaks inside %s into mdast break nodes',
    async (_, source) => {
      const code = await compile(source);

      expect(code).toContain('br: "br"');
      expect(code).toContain('_jsx(_components.br');
    },
  );
});
