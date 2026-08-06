import type { MDXContent, MDXProps } from 'mdx/types';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original',
  () => ({
    manifest: {
      '/media/cover.png': { src: '/assets/cover.hash.png' },
    },
  }),
);

import {
  createFeedSummaryFromHtml,
  renderFeedContentHtml,
} from './feedContent.server';

const TestContent: MDXContent = ({ components = {} }: MDXProps) => {
  const Anchor = (components.a ?? 'a') as ElementType<
    ComponentPropsWithoutRef<'a'>
  >;
  const Image = (components.img ?? 'img') as ElementType<
    ComponentPropsWithoutRef<'img'>
  >;
  const LinkCard = components.LinkCard as ElementType<{ url: string }>;
  const OEmbed = components.OEmbed as ElementType<{ url: string }>;

  return (
    <>
      <p>
        <Anchor href="/relative?x=1&y=2">Relative</Anchor>
      </p>
      <Image alt="Cover" src="/media/cover.png" />
      <LinkCard url="https://cards.example/item?x=1&y=2" />
      <OEmbed url="https://video.example/watch/1" />
    </>
  );
};

describe('renderFeedContentHtml', () => {
  it('renders MDX content to static HTML with absolute links and images', async () => {
    const html = await renderFeedContentHtml(
      TestContent,
      'https://example.com/blog/post',
    );

    expect(html).toContain(
      '<a href="https://example.com/relative?x=1&amp;y=2">Relative</a>',
    );
    expect(html).toContain('<img alt="Cover"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('src="https://example.com/assets/cover.hash.png"');
    expect(html).not.toContain('rel="preload"');
  });

  it('renders LinkCard and OEmbed components as plain links', async () => {
    const html = await renderFeedContentHtml(
      TestContent,
      'https://example.com/blog/post',
    );

    expect(html).toContain(
      '<a href="https://cards.example/item?x=1&amp;y=2">https://cards.example/item?x=1&amp;y=2</a>',
    );
    expect(html).toContain(
      '<a href="https://video.example/watch/1">https://video.example/watch/1</a>',
    );
    expect(html).not.toContain('Fetched card title');
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('rel="preload"');
  });
});

describe('createFeedSummaryFromHtml', () => {
  it('creates a short text summary from rendered HTML content', () => {
    expect(
      createFeedSummaryFromHtml(
        '<h2>Heading</h2><p><a href="https://example.com?a=1&amp;b=2">Link &amp; text</a></p><img alt="alt" src="/image.png"/>',
      ),
    ).toBe('Heading Link & text');
  });

  it('normalizes whitespace and truncates extracted text', () => {
    expect(
      createFeedSummaryFromHtml(
        '<ul><li>First</li><li>Second</li><li>Third</li></ul><script>ignored()</script>',
        13,
      ),
    ).toBe('First Second...');
  });
});
