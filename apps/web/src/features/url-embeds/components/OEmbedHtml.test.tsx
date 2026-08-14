import { fireEvent, render, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/testing/setup-tests';
import { OEmbedHtml } from './OEmbedHtml';
import styles from './OEmbedHtml.module.css';

const xScriptSrc = 'https://platform.x.com/widgets.js';
const xEmbedHtml = `<blockquote class="twitter-tweet">Tweet</blockquote><script async src="${xScriptSrc}"></script>`;
const retryScriptSrc = 'https://platform.x.com/retry-widgets.js';
const retryEmbedHtml = `<blockquote class="twitter-tweet">Tweet</blockquote><script async src="${retryScriptSrc}"></script>`;
const orderedScriptSrc = 'https://cdn.example.com/ordered-embed.js';
const orderedEmbedHtml = `<div data-ordered-embed></div><script src="${orderedScriptSrc}"></script><script data-oembed-ordered-initializer>window.initializeOrderedEmbed?.();</script>`;
const directExecutionScriptSrc = 'https://cdn.example.com/direct-execution.js';
const directExecutionEmbedHtml = `<div data-direct-execution-embed></div><script async data-oembed-direct-script src="${directExecutionScriptSrc}"></script>`;
const inlineRetryScriptSrc = 'https://platform.x.com/inline-retry.js';
const inlineRetryScriptId = 'inline-retry-twitter-wjs';
const inlineRetryEmbedHtml = `<blockquote class="twitter-tweet">Tweet</blockquote><script>if(!document.getElementById('${inlineRetryScriptId}')){var script=document.createElement('script');script.id='${inlineRetryScriptId}';script.async=true;script.src='${inlineRetryScriptSrc}';document.head.appendChild(script);}</script>`;
const inlineEmbedHtml =
  '<div data-inline-embed></div><script data-oembed-inline-initializer>window.initializeInlineEmbed?.();</script>';
const inlinePositionEmbedHtml =
  '<div data-inline-position="a"></div><script>document.currentScript?.previousElementSibling?.setAttribute("data-inline-initialized", "a");</script><div data-inline-position="b"></div><script>document.currentScript?.previousElementSibling?.setAttribute("data-inline-initialized", "b");</script>';

type ScriptTestWindow = Window & {
  happyDOM: {
    settings: {
      enableJavaScriptEvaluation: boolean;
    };
  };
  initializeInlineEmbed?: () => void;
  initializeDirectExternal?: () => void;
  initializeOrderedEmbed?: () => void;
  loadInlineTwitterEmbed?: (container?: HTMLElement) => void;
};

const scriptTestWindow = window as unknown as ScriptTestWindow;

afterEach(() => {
  scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = false;
  delete scriptTestWindow.initializeInlineEmbed;
  delete scriptTestWindow.initializeDirectExternal;
  delete scriptTestWindow.initializeOrderedEmbed;
  delete scriptTestWindow.loadInlineTwitterEmbed;
  delete window.twttr;
  document.getElementById(inlineRetryScriptId)?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('OEmbedHtml', () => {
  it('keeps provider scripts out of server-rendered markup', () => {
    const markup = renderToStaticMarkup(
      <OEmbedHtml
        fitIframes={false}
        heightSyncKey="https://x.com/example/status/1"
        html={`${xEmbedHtml}${inlineEmbedHtml}`}
      />,
    );

    expect(markup).toContain('<blockquote class="twitter-tweet">');
    expect(markup).not.toContain('<script');
    expect(markup).not.toContain('platform.x.com/widgets.js');
    expect(markup).not.toContain('initializeInlineEmbed');
  });

  it('executes inline initialization after hydration only in the content layer', async () => {
    scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = true;
    const initializeInlineEmbed = vi.fn();
    scriptTestWindow.initializeInlineEmbed = initializeInlineEmbed;

    const renderLayers = () =>
      render(
        <StrictMode>
          <div data-cutout-layer="stencil">
            <OEmbedHtml
              fitIframes
              heightSyncKey="inline-embed"
              html={inlineEmbedHtml}
            />
          </div>
          <div data-cutout-layer="content">
            <OEmbedHtml
              fitIframes
              heightSyncKey="inline-embed"
              html={inlineEmbedHtml}
            />
          </div>
        </StrictMode>,
      );

    const firstRender = renderLayers();
    await waitFor(() => {
      expect(initializeInlineEmbed).toHaveBeenCalledOnce();
    });

    expect(firstRender.container.querySelector('script')).toBeNull();
    expect(
      firstRender.container.querySelector(
        '[data-cutout-layer="content"] template',
      ),
    ).toBeNull();
    expect(
      firstRender.container.querySelector(
        '[data-cutout-layer="stencil"] template',
      ),
    ).toBeTruthy();

    const pageShow = new Event('pageshow');
    Object.defineProperty(pageShow, 'persisted', { value: true });
    window.dispatchEvent(pageShow);
    await Promise.resolve();

    expect(initializeInlineEmbed).toHaveBeenCalledOnce();

    firstRender.unmount();
    renderLayers();

    await waitFor(() => {
      expect(initializeInlineEmbed).toHaveBeenCalledTimes(2);
    });
  });

  it('executes inline initialization at its original DOM position', async () => {
    scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = true;

    const { container } = render(
      <OEmbedHtml
        fitIframes
        heightSyncKey="inline-position"
        html={inlinePositionEmbedHtml}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-inline-position="a"]'),
      ).toHaveAttribute('data-inline-initialized', 'a');
      expect(
        container.querySelector('[data-inline-position="b"]'),
      ).toHaveAttribute('data-inline-initialized', 'b');
    });
  });

  it('waits for a preceding external script before executing inline initialization', async () => {
    scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = true;
    const initializeOrderedEmbed = vi.fn();
    scriptTestWindow.initializeOrderedEmbed = initializeOrderedEmbed;
    const appendToHead = vi
      .spyOn(document.head, 'appendChild')
      .mockImplementation((node) => node);

    render(
      <OEmbedHtml
        fitIframes
        heightSyncKey="ordered-embed"
        html={orderedEmbedHtml}
      />,
    );
    const externalScript = appendToHead.mock.calls[0]?.[0] as HTMLScriptElement;

    expect(externalScript.src).toBe(orderedScriptSrc);
    expect(initializeOrderedEmbed).not.toHaveBeenCalled();

    fireEvent.load(externalScript);

    await waitFor(() => {
      expect(initializeOrderedEmbed).toHaveBeenCalledOnce();
    });
  });

  it('creates a fresh executable element for a parsed external script', async () => {
    scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = true;
    const initializeDirectExternal = vi.fn();
    scriptTestWindow.initializeDirectExternal = initializeDirectExternal;
    server.use(
      http.get(directExecutionScriptSrc, () =>
        HttpResponse.text('window.initializeDirectExternal?.();', {
          headers: { 'Content-Type': 'text/javascript' },
        }),
      ),
    );

    render(
      <OEmbedHtml
        fitIframes
        heightSyncKey="direct-execution-embed"
        html={directExecutionEmbedHtml}
      />,
    );

    await waitFor(() => {
      expect(initializeDirectExternal).toHaveBeenCalledOnce();
    });
    expect(
      document.querySelector('script[data-oembed-direct-script]'),
    ).toHaveAttribute('data-oembed-script-loaded', 'true');
  });

  it('retries a failed script created by an inline loader after remount', async () => {
    scriptTestWindow.happyDOM.settings.enableJavaScriptEvaluation = true;
    const loadInlineTwitterEmbed = vi.fn();
    scriptTestWindow.loadInlineTwitterEmbed = loadInlineTwitterEmbed;
    let requestCount = 0;
    server.use(
      http.get(inlineRetryScriptSrc, () => {
        requestCount += 1;

        if (requestCount === 1) {
          return HttpResponse.text(
            "document.currentScript.onload=null;document.currentScript.dispatchEvent(new Event('error'));",
            { headers: { 'Content-Type': 'text/javascript' } },
          );
        }

        return HttpResponse.text(
          'window.twttr={widgets:{load:window.loadInlineTwitterEmbed}};',
          { headers: { 'Content-Type': 'text/javascript' } },
        );
      }),
    );

    const firstRender = render(
      <OEmbedHtml
        fitIframes
        heightSyncKey="inline-retry"
        html={inlineRetryEmbedHtml}
      />,
    );

    await waitFor(() => {
      expect(requestCount).toBe(1);
      expect(document.getElementById(inlineRetryScriptId)).toBeNull();
    });

    firstRender.unmount();
    const secondRender = render(
      <OEmbedHtml
        fitIframes
        heightSyncKey="inline-retry"
        html={inlineRetryEmbedHtml}
      />,
    );
    const secondContainer = secondRender.container.querySelector(
      '[data-oembed-height-sync-key]',
    );

    await waitFor(() => {
      expect(requestCount).toBe(2);
      expect(loadInlineTwitterEmbed).toHaveBeenCalledOnce();
    });

    expect(loadInlineTwitterEmbed).toHaveBeenCalledWith(secondContainer);
    expect(document.getElementById(inlineRetryScriptId)).toHaveAttribute(
      'src',
      inlineRetryScriptSrc,
    );
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
