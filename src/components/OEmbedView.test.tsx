import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OEmbedView } from './OEmbedView';

describe('OEmbedView', () => {
  it('renders video oEmbed iframe HTML directly', () => {
    const html = renderToStaticMarkup(
      <OEmbedView
        metadata={{
          url: 'https://youtu.be/example',
          type: 'video',
          version: '1.0',
          title: 'Video title',
          html: '<iframe src="https://www.youtube.com/embed/example"></iframe>',
          width: 640,
          height: 360,
          fetchedAt: '2026-04-26T00:00:00.000Z',
        }}
        url="https://youtu.be/example"
      />,
    );

    expect(html).toContain('src="https://www.youtube.com/embed/example"');
    expect(html).toContain('aspect-ratio:640 / 360');
    expect(html).toContain('[&amp;_iframe]:h-full');
    expect(html).toContain('[&amp;_iframe]:w-full');
  });

  it('renders photo responses as linked images', () => {
    const html = renderToStaticMarkup(
      <OEmbedView
        metadata={{
          url: 'https://example.com/photo',
          type: 'photo',
          version: '1.0',
          title: 'Photo title',
          photoUrl: 'https://example.com/photo.jpg',
          fetchedAt: '2026-04-26T00:00:00.000Z',
        }}
        url="https://example.com/photo"
      />,
    );

    expect(html).toContain('https://example.com/photo.jpg');
    expect(html).toContain('Photo title');
  });

  it('renders non-iframe rich oEmbed HTML directly', () => {
    const html = renderToStaticMarkup(
      <OEmbedView
        metadata={{
          url: 'https://example.com/post/1',
          type: 'rich',
          version: '1.0',
          providerName: 'Example',
          html: '<blockquote class="provider-post"><p>Provider HTML</p></blockquote><script async src="https://example.com/widgets.js"></script>',
          width: 550,
          fetchedAt: '2026-04-26T00:00:00.000Z',
        }}
        url="https://example.com/post/1"
      />,
    );

    expect(html).not.toContain('srcDoc=');
    expect(html).not.toContain('sandbox=');
    expect(html).toContain('Provider HTML');
    expect(html).toContain('https://example.com/widgets.js');
    expect(html).not.toContain('aspect-ratio');
    expect(html).not.toContain('[&amp;_iframe]:h-full');
  });
});
