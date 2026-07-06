import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OEmbedView } from './OEmbedView';

describe('OEmbedView', () => {
  it('renders video oEmbed iframe HTML directly', () => {
    const { container } = render(
      <OEmbedView
        metadata={{
          url: 'https://youtu.be/example',
          type: 'video',
          version: '1.0',
          title: 'Video title',
          html: '<iframe src="about:blank"></iframe>',
          width: 640,
          height: 360,
          fetchedAt: '2026-04-26T00:00:00.000Z',
        }}
        url="https://youtu.be/example"
      />,
    );

    const shell = container.firstElementChild as HTMLElement | null;
    const iframe = container.querySelector('iframe');
    const htmlShell = iframe?.parentElement;

    expect(iframe).toHaveAttribute('src', 'about:blank');
    expect(shell?.style.aspectRatio).toBe('640 / 360');
    expect(shell?.className).not.toContain('border-cutout-hole');
    expect(shell?.className).not.toContain('p-4');
    expect(htmlShell?.className).toContain('[&_iframe]:h-full');
    expect(htmlShell?.className).toContain('[&_iframe]:w-full');
  });

  it('renders photo responses as linked images', () => {
    render(
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

    const link = screen.getByRole('link');
    const image = screen.getByRole('img', { name: 'Photo title' });

    expect(link).toHaveAttribute('href', 'https://example.com/photo');
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders non-iframe rich oEmbed HTML directly', () => {
    const { container } = render(
      <OEmbedView
        metadata={{
          url: 'https://example.com/post/1',
          type: 'rich',
          version: '1.0',
          providerName: 'Example',
          html: '<blockquote class="provider-post"><p>Provider HTML</p></blockquote><script>window.__providerWidget = true;</script>',
          width: 550,
          fetchedAt: '2026-04-26T00:00:00.000Z',
        }}
        url="https://example.com/post/1"
      />,
    );

    const shell = container.firstElementChild as HTMLElement | null;
    const providerPost = container.querySelector('blockquote.provider-post');
    const htmlShell = providerPost?.parentElement;

    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('[srcdoc]')).toBeNull();
    expect(container.querySelector('[sandbox]')).toBeNull();
    expect(shell?.className).not.toContain('border-cutout-hole');
    expect(shell?.className).not.toContain('p-4');
    expect(providerPost).toBeInTheDocument();
    expect(providerPost).toHaveTextContent('Provider HTML');
    expect(container.querySelector('script')?.textContent).toContain(
      'window.__providerWidget = true;',
    );
    expect(shell?.style.aspectRatio).toBe('');
    expect(htmlShell?.className).not.toContain('[&_iframe]:h-full');
  });
});
