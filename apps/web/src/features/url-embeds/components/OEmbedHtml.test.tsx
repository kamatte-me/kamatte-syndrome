import { fireEvent, render, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OEmbedHtml } from './OEmbedHtml';
import styles from './OEmbedHtml.module.css';

const xScriptSrc = 'https://platform.x.com/widgets.js';
const xEmbedHtml = `<blockquote class="twitter-tweet">Tweet</blockquote><script async src="${xScriptSrc}"></script>`;
const retryScriptSrc = 'https://platform.x.com/retry-widgets.js';
const retryEmbedHtml = `<blockquote class="twitter-tweet">Tweet</blockquote><script async src="${retryScriptSrc}"></script>`;

afterEach(() => {
  delete window.twttr;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('OEmbedHtml', () => {
  it('keeps provider scripts out of server-rendered markup', () => {
    const markup = renderToStaticMarkup(
      <OEmbedHtml
        fitIframes={false}
        heightSyncKey="https://x.com/example/status/1"
        html={xEmbedHtml}
      />,
    );

    expect(markup).toContain('<blockquote class="twitter-tweet">');
    expect(markup).not.toContain('<script');
    expect(markup).not.toContain('platform.x.com/widgets.js');
  });

  it('loads the provider runtime from content and mirrors its height to the stencil', async () => {
    const widgetsLoad = vi.fn();
    const disconnect = vi.fn();
    let contentHeight = 96;
    let notifyResize: (() => void) | undefined;

    class ResizeObserverMock {
      disconnect = disconnect;
      observe = vi.fn();
      unobserve = vi.fn();

      constructor(callback: ResizeObserverCallback) {
        notifyResize = () => callback([], this as unknown as ResizeObserver);
      }
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const isContentEmbed =
          this.matches('[data-oembed-height-sync-key]') &&
          this.closest('[data-cutout-layer="content"]');

        return new DOMRect(0, 0, 550, isContentEmbed ? contentHeight : 0);
      },
    );

    const appendChild = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => node);

    const { container, unmount } = render(
      <>
        <div data-cutout-layer="stencil">
          <OEmbedHtml
            fitIframes={false}
            heightSyncKey="https://x.com/example/status/1"
            html={xEmbedHtml}
          />
        </div>
        <div data-cutout-layer="content">
          <OEmbedHtml
            fitIframes={false}
            heightSyncKey="https://x.com/example/status/1"
            html={xEmbedHtml}
          />
        </div>
      </>,
    );
    const stencilEmbed = container.querySelector<HTMLElement>(
      '[data-cutout-layer="stencil"] [data-oembed-height-sync-key]',
    );
    const contentEmbed = container.querySelector<HTMLElement>(
      '[data-cutout-layer="content"] [data-oembed-height-sync-key]',
    );
    const stencilBlockquote = stencilEmbed?.querySelector('blockquote');
    const contentBlockquote = contentEmbed?.querySelector('blockquote');
    const script = appendChild.mock.calls[0]?.[0] as
      | HTMLScriptElement
      | undefined;

    expect(stencilBlockquote).not.toHaveClass('twitter-tweet');
    expect(contentBlockquote).toHaveClass('twitter-tweet');
    expect(stencilEmbed).toHaveClass(styles.root);
    expect(contentEmbed).toHaveClass(styles.root);
    expect(container.querySelector('script')).toBeNull();
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(script?.src).toBe(xScriptSrc);
    expect(stencilEmbed?.style.height).toBe('96px');

    window.twttr = { widgets: { load: widgetsLoad } };
    fireEvent.load(script as HTMLScriptElement);

    await waitFor(() => {
      expect(widgetsLoad).toHaveBeenCalledOnce();
      expect(widgetsLoad).toHaveBeenCalledWith(contentEmbed);
    });

    contentHeight = 782;
    notifyResize?.();

    expect(stencilEmbed?.style.height).toBe('782px');

    unmount();

    expect(disconnect).toHaveBeenCalledOnce();
    expect(stencilEmbed?.style.height).toBe('');
  });

  it('retries the provider script after a failed load', async () => {
    const widgetsLoad = vi.fn();
    const appendChild = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => node);

    const firstRender = render(
      <OEmbedHtml
        fitIframes={false}
        heightSyncKey="https://x.com/example/status/retry"
        html={retryEmbedHtml}
      />,
    );
    const failedScript = appendChild.mock.calls[0]?.[0] as HTMLScriptElement;
    const remove = vi.spyOn(failedScript, 'remove');

    fireEvent.error(failedScript);

    expect(remove).toHaveBeenCalledOnce();
    expect(widgetsLoad).not.toHaveBeenCalled();

    firstRender.unmount();

    const secondRender = render(
      <OEmbedHtml
        fitIframes={false}
        heightSyncKey="https://x.com/example/status/retry"
        html={retryEmbedHtml}
      />,
    );
    const retriedScript = appendChild.mock.calls[1]?.[0] as HTMLScriptElement;
    const retriedContainer = secondRender.container.querySelector(
      '[data-oembed-height-sync-key]',
    );

    expect(appendChild).toHaveBeenCalledTimes(2);
    expect(retriedScript).not.toBe(failedScript);
    expect(retriedScript.src).toBe(retryScriptSrc);

    window.twttr = { widgets: { load: widgetsLoad } };
    fireEvent.load(retriedScript);

    await waitFor(() => {
      expect(widgetsLoad).toHaveBeenCalledOnce();
      expect(widgetsLoad).toHaveBeenCalledWith(retriedContainer);
    });
  });

  it('keeps a remounted stencil fallback out of the provider scan', () => {
    const widgetsLoad = vi.fn();

    class ResizeObserverMock {
      disconnect = vi.fn();
      observe = vi.fn();
      unobserve = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    window.twttr = { widgets: { load: widgetsLoad } };

    const renderLayers = () =>
      render(
        <>
          <div data-cutout-layer="stencil">
            <OEmbedHtml
              fitIframes={false}
              heightSyncKey="https://x.com/example/status/1"
              html={xEmbedHtml}
            />
          </div>
          <div data-cutout-layer="content">
            <OEmbedHtml
              fitIframes={false}
              heightSyncKey="https://x.com/example/status/1"
              html={xEmbedHtml}
            />
          </div>
        </>,
      );

    const firstRender = renderLayers();
    firstRender.unmount();

    const secondRender = renderLayers();
    const stencilBlockquote = secondRender.container.querySelector(
      '[data-cutout-layer="stencil"] blockquote',
    );

    expect(stencilBlockquote).not.toHaveClass('twitter-tweet');
    expect(widgetsLoad).toHaveBeenCalledTimes(2);

    for (const [container] of widgetsLoad.mock.calls) {
      expect(container).toBeInstanceOf(HTMLElement);
      expect(
        (container as HTMLElement).closest('[data-cutout-layer]'),
      ).toHaveAttribute('data-cutout-layer', 'content');
    }
  });
});
