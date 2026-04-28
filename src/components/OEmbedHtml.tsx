'use client';

import { memo, useEffect, useRef } from 'react';

type OEmbedHtmlProps = {
  fitIframes: boolean;
  html: string;
};

const anyScriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const externalScriptPattern = /<script[^>]+src=(['"])(.*?)\1/i;
const injectedScriptPattern =
  /<script[\s\S]*?>[\s\S]*?createElement[\s\S]*?src\s?=\s?(['"])(.*?)\1/i;

const scriptLoads = new Map<string, Promise<void>>();

export const OEmbedHtml = memo(
  function OEmbedHtml({ fitIframes, html }: OEmbedHtmlProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      renderEmbeds(html, container);

      const handlePageShow = () => renderEmbeds(html, container);
      window.addEventListener('pageshow', handlePageShow);

      return () => {
        window.removeEventListener('pageshow', handlePageShow);
      };
    }, [html]);

    return (
      <div
        className={fitIframes ? fittedHtmlClassName : flowHtmlClassName}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: oEmbed provider HTML is trusted by product choice and provider scripts are executed deliberately.
        dangerouslySetInnerHTML={{ __html: html }}
        ref={containerRef}
      />
    );
  },
  (previous, next) =>
    previous.fitIframes === next.fitIframes && previous.html === next.html,
);

const fittedHtmlClassName =
  'h-full w-full [&_iframe]:h-full [&_iframe]:max-h-full [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:border-0 [&_img]:max-h-full [&_img]:max-w-full';

const flowHtmlClassName =
  'my-3 w-full [&_iframe]:max-w-full [&_iframe]:border-0 [&_img]:max-w-full';

type EmbedProfile = {
  isLoaded: () => boolean;
  reload: (container: HTMLElement) => void;
};

const embedProfiles: Record<string, EmbedProfile> = {
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
  'platform.twitter.com': {
    isLoaded: () => window.twttr?.widgets?.load !== undefined,
    reload: () => window.twttr?.widgets?.load(),
  },
  'trellocdn.com': {
    isLoaded: () => window.TrelloCards?.load !== undefined,
    reload: () =>
      window.TrelloCards?.load(document, {
        allAnchors: false,
        compact: false,
      }),
  },
};

function renderEmbeds(html: string, container: HTMLElement) {
  for (const src of getScriptUrls(html)) {
    const profile = getEmbedProfile(src);

    if (profile?.isLoaded()) {
      profile.reload(container);
      continue;
    }

    const load = loadScript(src);
    if (profile) {
      void load.then(() => profile.reload(container));
    }
  }
}

function getScriptUrls(html: string) {
  const scripts = html.match(anyScriptPattern);
  if (!scripts) {
    return [];
  }

  return unique(scripts.map(extractScriptUrl).filter(isString));
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

function getEmbedProfile(src: string) {
  return Object.entries(embedProfiles).find(([key]) => src.includes(key))?.[1];
}

function normalizeScriptSrc(src: string) {
  return src.replace('&amp;', '&');
}

function loadScript(src: string) {
  const normalizedSrc = normalizeScriptSrc(src);
  const existingLoad = scriptLoads.get(normalizedSrc);
  if (existingLoad) {
    return existingLoad;
  }

  const script = document.createElement('script');
  script.src = normalizedSrc;
  const load = createScriptLoadPromise(script);
  scriptLoads.set(normalizedSrc, load);
  document.head.appendChild(script);
  return load;
}

function createScriptLoadPromise(script: HTMLScriptElement) {
  if (script.dataset.oembedScriptLoaded === 'true') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    script.addEventListener(
      'load',
      () => {
        script.dataset.oembedScriptLoaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => resolve(), { once: true });
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
