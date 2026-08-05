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
const injectedScriptPattern = /createElement[\s\S]*?src\s?=\s?(['"])(.*?)\1/gi;
const scriptPlaceholderAttribute = 'data-oembed-script-placeholder';

type ScriptLoad = {
  promise: Promise<boolean>;
  script: HTMLScriptElement;
};

type EmbedScriptState = {
  active: boolean;
  hasHydrated: boolean;
  html: string;
  operation: Promise<void>;
};

const scriptLoads = new Map<string, ScriptLoad>();

export const OEmbedHtml = memo(
  function OEmbedHtml({ fitIframes, heightSyncKey, html }: OEmbedHtmlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scriptStateRef = useRef<EmbedScriptState | undefined>(undefined);
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

      let scriptState = scriptStateRef.current;
      if (!scriptState || scriptState.html !== html) {
        scriptState = {
          active: true,
          hasHydrated: false,
          html,
          operation: Promise.resolve(),
        };
        scriptStateRef.current = scriptState;
      } else {
        scriptState.active = true;
      }

      if (!scriptState.hasHydrated) {
        scriptState.hasHydrated = true;
        scriptState.operation = hydrateProviderEmbeds(
          html,
          container,
          scriptState,
          true,
        );
      }

      const handlePageShow = (event: PageTransitionEvent) => {
        if (!event.persisted) {
          return;
        }

        const reload = () =>
          hydrateProviderEmbeds(html, container, scriptState, false);
        scriptState.operation = scriptState.operation.then(reload, reload);
      };
      window.addEventListener('pageshow', handlePageShow);

      return () => {
        scriptState.active = false;
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

async function hydrateProviderEmbeds(
  html: string,
  container: HTMLElement,
  scriptState: EmbedScriptState,
  executeInlineScripts: boolean,
) {
  const runtimes = new Set<ProviderRuntime>();
  const asyncLoads = new Set<Promise<boolean>>();
  const deferredScripts: HTMLScriptElement[] = [];

  for (const [scriptIndex, sourceScript] of getEmbedScripts(html).entries()) {
    if (!isScriptStateActive(scriptState, container)) {
      return;
    }

    const src = sourceScript.getAttribute('src');
    if (!src) {
      addProviderRuntimes(sourceScript, runtimes);
      if (executeInlineScripts) {
        executeInlineScript(sourceScript, container, scriptIndex);
      }

      for (const injectedSrc of getInjectedScriptSrcs(sourceScript)) {
        const runtime = getProviderRuntime(injectedSrc);
        if (runtime) {
          runtimes.add(runtime);
          if (runtime.isLoaded()) {
            continue;
          }
        }

        const load = loadScript(injectedSrc);
        asyncLoads.add(load);
      }
      continue;
    }

    const runtime = getProviderRuntime(src);
    if (runtime) {
      runtimes.add(runtime);
    }

    if (
      sourceScript.hasAttribute('defer') &&
      !sourceScript.hasAttribute('async')
    ) {
      deferredScripts.push(sourceScript);
      continue;
    }

    const load = loadExternalScript(sourceScript);
    if (!load) {
      continue;
    }

    if (sourceScript.hasAttribute('async')) {
      asyncLoads.add(load);
    } else {
      await load;
    }
  }

  for (const sourceScript of deferredScripts) {
    if (!isScriptStateActive(scriptState, container)) {
      return;
    }

    const load = loadExternalScript(sourceScript);
    if (load) {
      await load;
    }
  }

  if (asyncLoads.size > 0) {
    await Promise.all(asyncLoads);
  }

  if (!isScriptStateActive(scriptState, container)) {
    return;
  }

  for (const runtime of runtimes) {
    if (runtime.isLoaded()) {
      runtime.reload(container);
    }
  }
}

function stripScripts(html: string) {
  let scriptIndex = 0;
  return html.replace(
    anyScriptPattern,
    () =>
      `<template ${scriptPlaceholderAttribute}="${scriptIndex++}"></template>`,
  );
}

function getEmbedScripts(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return [...template.content.querySelectorAll('script')];
}

function executeInlineScript(
  sourceScript: HTMLScriptElement,
  container: HTMLElement,
  scriptIndex: number,
) {
  const script = copyScriptAttributes(
    sourceScript,
    document.createElement('script'),
  );
  script.textContent = sourceScript.textContent;
  const placeholder = container.querySelector<HTMLTemplateElement>(
    `template[${scriptPlaceholderAttribute}="${scriptIndex}"]`,
  );
  placeholder?.replaceWith(script);
  script.remove();
}

function getInjectedScriptSrcs(sourceScript: HTMLScriptElement) {
  const source = sourceScript.textContent ?? '';
  return [...source.matchAll(injectedScriptPattern)].flatMap((match) =>
    match[2] ? [match[2]] : [],
  );
}

function addProviderRuntimes(
  script: HTMLScriptElement,
  runtimes: Set<ProviderRuntime>,
) {
  const source = `${script.getAttribute('src') ?? ''}\n${script.textContent}`;
  for (const [key, runtime] of Object.entries(providerRuntimes)) {
    if (source.includes(key)) {
      runtimes.add(runtime);
    }
  }
}

function isScriptStateActive(
  scriptState: EmbedScriptState,
  container: HTMLElement,
) {
  return scriptState.active && container.isConnected;
}

function getProviderRuntime(src: string) {
  return Object.entries(providerRuntimes).find(([key]) =>
    src.includes(key),
  )?.[1];
}

function loadExternalScript(sourceScript: HTMLScriptElement) {
  const src = sourceScript.getAttribute('src');
  if (!src) {
    return undefined;
  }

  const runtime = getProviderRuntime(src);
  return runtime?.isLoaded() ? undefined : loadScript(sourceScript);
}

function normalizeScriptSrc(src: string) {
  const decodedSrc = src.replaceAll('&amp;', '&');

  try {
    return new URL(decodedSrc, document.baseURI).href;
  } catch {
    return decodedSrc;
  }
}

function loadScript(source: HTMLScriptElement | string) {
  const src =
    typeof source === 'string' ? source : (source.getAttribute('src') ?? '');
  const normalizedSrc = normalizeScriptSrc(src);
  const existingLoad = scriptLoads.get(normalizedSrc);
  if (existingLoad) {
    return existingLoad.promise;
  }

  const existingScript = [
    ...document.querySelectorAll<HTMLScriptElement>('script[src]'),
  ].find(
    (script) =>
      normalizeScriptSrc(script.getAttribute('src') ?? '') === normalizedSrc,
  );
  if (existingScript) {
    return trackScriptLoad(existingScript, normalizedSrc);
  }

  const script =
    typeof source === 'string'
      ? document.createElement('script')
      : copyScriptAttributes(source, document.createElement('script'));
  script.src = normalizedSrc;
  const load = trackScriptLoad(script, normalizedSrc);
  document.head.appendChild(script);
  return load;
}

function trackScriptLoad(script: HTMLScriptElement, src: string) {
  const existingLoad = scriptLoads.get(src);
  if (existingLoad) {
    return existingLoad.promise;
  }

  let promise: Promise<boolean>;
  promise = createScriptLoadPromise(script, () => {
    if (scriptLoads.get(src)?.promise === promise) {
      scriptLoads.delete(src);
    }
    script.remove();
  });
  scriptLoads.set(src, { promise, script });
  return promise;
}

function copyScriptAttributes(
  source: HTMLScriptElement,
  target: HTMLScriptElement,
) {
  for (const attribute of source.attributes) {
    target.setAttribute(attribute.name, attribute.value);
  }
  return target;
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
