import { mdxToJs } from 'satteri';
import { describe, expect, it, vi } from 'vitest';
import { satteriMdxUrlEmbed } from './index.ts';

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

async function compile(source: string) {
  const result = await mdxToJs(source, {
    features: { gfm: true, frontmatter: true },
    mdastPlugins: [satteriMdxUrlEmbed],
    jsxImportSource: 'react',
  });

  return result.code;
}

describe('satteriMdxUrlEmbed', () => {
  it('converts an oEmbed URL paragraph into an OEmbed MDX element', async () => {
    const code = await compile('https://oembed.example/watch/1');

    expect(code).toContain('const { OEmbed } = props.components || {};');
    expect(code).toContain('url: "https://oembed.example/watch/1"');
  });

  it('converts a non-oEmbed standalone URL paragraph into a LinkCard MDX element', async () => {
    const code = await compile('https://example.com/posts/1');

    expect(code).toContain('const { LinkCard } = props.components || {};');
    expect(code).toContain('url: "https://example.com/posts/1"');
  });

  it('keeps explicit markdown links as links even when the label is the URL', async () => {
    const url = 'https://www.homepage-tukurikata.com/html/pre-code.html';
    const code = await compile(`[${url}](${url})`);

    expect(code).not.toContain('LinkCard');
    expect(code).not.toContain('OEmbed');
    expect(code).toContain(`href: "${url}"`);
  });

  it('does not convert URLs nested in blockquotes or lists', async () => {
    const code = await compile(
      '> https://example.com\n\n- https://example.net',
    );

    expect(code).not.toContain('LinkCard');
    expect(code).not.toContain('OEmbed');
    expect(code).toContain('href: "https://example.com"');
    expect(code).toContain('href: "https://example.net"');
  });
});
