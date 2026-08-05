'use client';

import { memo, useEffect, useRef } from 'react';
import { cn } from '@/utils/classNames';
import styles from './OEmbedHtml.module.css';

type OEmbedHtmlProps = {
  fitIframes: boolean;
  html: string;
  heightSyncKey: string;
};

const anyScriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const externalScriptPattern = /<script[^>]+src=(['"])(.*?)\1/i;
const injectedScriptPattern =
  /<script[\s\S]*?>[\s\S]*?createElement[\s\S]*?src\s?=\s?(['"])(.*?)\1/i;

const scriptLoads = new Map<string, Promise<boolean>>();

export const OEmbedHtml = memo(
  function OEmbedHtml({ fitIframes, heightSyncKey, html }: OEmbedHtmlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const markup = stripScripts(html);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const cutoutLayer = getCutoutLayer(container);
      const stopHeightSync = fitIframes
        ? undefined
        : syncStencilHeight(container, heightSyncKey);

      if (cutoutLayer === 'stencil' || cutoutLayer === 'modal-stencil') {
        preventStencilProviderHydration(container);
        return stopHeightSync;
      }

      hydrateProviderEmbeds(html, container);

      const handlePageShow = () => hydrateProviderEmbeds(html, container);
      window.addEventListener('pageshow', handlePageShow);

      return () => {
        stopHeightSync?.();
        window.removeEventListener('pageshow', handlePageShow);
      };
    }, [fitIframes, heightSyncKey, html]);

    return (
      <div
        className={cn(
          styles.root,
          'w-full [&_iframe]:max-w-full [&_iframe]:border-0 [&_img]:max-w-full',
          fitIframes
            ? 'h-full [&_iframe]:h-full [&_iframe]:max-h-full [&_iframe]:w-full [&_img]:max-h-full'
            : 'my-3 overflow-hidden',
        )}
        data-oembed-height-sync-key={heightSyncKey}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: oEmbed provider markup is trusted by product choice; scripts are loaded after hydration.
        dangerouslySetInnerHTML={{ __html: markup }}
        ref={containerRef}
      />
    );
  },
  (previous, next) =>
    previous.fitIframes === next.fitIframes &&
    previous.heightSyncKey === next.heightSyncKey &&
    previous.html === next.html,
);

const heightSyncSelector = '[data-oembed-height-sync-key]';

function syncStencilHeight(source: HTMLElement, heightSyncKey: string) {
  if (getCutoutLayer(source) !== 'content') {
    return undefined;
  }

  let target: HTMLElement | undefined;

  const updateStencilHeight = () => {
    const sources = getLayerEmbeds('content', heightSyncKey);
    const sourceIndex = sources.indexOf(source);
    const nextTarget = getLayerEmbeds('stencil', heightSyncKey)[sourceIndex];

    if (target !== nextTarget) {
      target?.style.removeProperty('height');
      target = nextTarget;
    }

    if (!target) {
      return;
    }

    target.style.height = `${source.getBoundingClientRect().height}px`;
  };

  const resizeObserver = new ResizeObserver(updateStencilHeight);
  resizeObserver.observe(source);
  updateStencilHeight();

  return () => {
    resizeObserver.disconnect();
    target?.style.removeProperty('height');
  };
}

function getLayerEmbeds(layer: string, heightSyncKey: string) {
  const layerRoot = document.querySelector<HTMLElement>(
    `[data-cutout-layer="${layer}"]`,
  );

  if (!layerRoot) {
    return [];
  }

  return [
    ...layerRoot.querySelectorAll<HTMLElement>(heightSyncSelector),
  ].filter((embed) => embed.dataset.oembedHeightSyncKey === heightSyncKey);
}

function getCutoutLayer(element: HTMLElement) {
  return element.closest<HTMLElement>('[data-cutout-layer]')?.dataset
    .cutoutLayer;
}

function preventStencilProviderHydration(container: HTMLElement) {
  for (const blockquote of container.querySelectorAll(
    'blockquote.twitter-tweet',
  )) {
    blockquote.classList.remove('twitter-tweet');
  }
}

type ProviderRuntime = {
  isLoaded: () => boolean;
  reload: (container: HTMLElement) => void;
};

const twitterRuntime: ProviderRuntime = {
  isLoaded: () => window.twttr?.widgets?.load !== undefined,
  reload: (container) => window.twttr?.widgets?.load(container),
};

const providerRuntimes: Record<string, ProviderRuntime> = {
  'connect.facebook.net': {
    isLoaded: () => {
      ensureFacebookRoot();
      return window.FB?.XFBML?.parse !== undefined;
    },
    reload: (container) => {
      ensureFacebookRoot();
      window.FB?.XFBML?.parse(container);
    },
  },
  'instagram.com': {
    isLoaded: () => window.instgrm?.Embeds?.process !== undefined,
    reload: () => window.instgrm?.Embeds?.process(),
  },
  'platform.twitter.com': twitterRuntime,
  'platform.x.com': twitterRuntime,
  'trellocdn.com': {
    isLoaded: () => window.TrelloCards?.load !== undefined,
    reload: () =>
      window.TrelloCards?.load(document, {
        allAnchors: false,
        compact: false,
      }),
  },
};

function hydrateProviderEmbeds(html: string, container: HTMLElement) {
  for (const src of getProviderScriptUrls(html)) {
    const runtime = getProviderRuntime(src);

    if (runtime?.isLoaded()) {
      runtime.reload(container);
      continue;
    }

    const load = loadScript(src);
    if (runtime) {
      void load.then((isLoaded) => {
        if (isLoaded) {
          runtime.reload(container);
        }
      });
    }
  }
}

function getProviderScriptUrls(html: string) {
  const scripts = html.match(anyScriptPattern);
  if (!scripts) {
    return [];
  }

  return unique(scripts.map(extractScriptUrl).filter(isString));
}

function stripScripts(html: string) {
  return html.replace(anyScriptPattern, '');
}

function extractScriptUrl(script: string) {
  return (
    extractExternalScriptUrl(script) ?? extractInjectedScriptUrl(script) ?? null
  );
}

function extractExternalScriptUrl(script: string) {
  return script.match(externalScriptPattern)?.[2] ?? null;
}

function extractInjectedScriptUrl(script: string) {
  return script.match(injectedScriptPattern)?.[2] ?? null;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function isString(value: string | null): value is string {
  return typeof value === 'string';
}

function getProviderRuntime(src: string) {
  return Object.entries(providerRuntimes).find(([key]) =>
    src.includes(key),
  )?.[1];
}

function normalizeScriptSrc(src: string) {
  return src.replaceAll('&amp;', '&');
}

function loadScript(src: string) {
  const normalizedSrc = normalizeScriptSrc(src);
  const existingLoad = scriptLoads.get(normalizedSrc);
  if (existingLoad) {
    return existingLoad;
  }

  const script = document.createElement('script');
  script.src = normalizedSrc;
  const load = createScriptLoadPromise(script, () => {
    scriptLoads.delete(normalizedSrc);
    script.remove();
  });
  scriptLoads.set(normalizedSrc, load);
  document.head.appendChild(script);
  return load;
}

function createScriptLoadPromise(
  script: HTMLScriptElement,
  handleError: () => void,
) {
  if (script.dataset.oembedScriptLoaded === 'true') {
    return Promise.resolve(true);
  }

  return new Promise<boolean>((resolve) => {
    script.addEventListener(
      'load',
      () => {
        script.dataset.oembedScriptLoaded = 'true';
        resolve(true);
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        handleError();
        resolve(false);
      },
      { once: true },
    );
  });
}

function ensureFacebookRoot() {
  if (document.querySelector('body > #fb-root')) {
    return;
  }

  for (const root of document.querySelectorAll('#fb-root')) {
    root.remove();
  }

  const root = document.createElement('div');
  root.id = 'fb-root';
  document.body.appendChild(root);
}

declare global {
  interface Window {
    FB?: {
      XFBML?: {
        parse: (container?: HTMLElement) => void;
      };
    };
    instgrm?: {
      Embeds?: {
        process: () => void;
      };
    };
    TrelloCards?: {
      load: (
        document: Document,
        options: { allAnchors: boolean; compact: boolean },
      ) => void;
    };
    twttr?: {
      widgets?: {
        load: (container?: HTMLElement) => void;
      };
    };
  }
}
