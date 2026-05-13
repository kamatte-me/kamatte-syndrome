import type { ReactNode } from 'react';
import styles from './GlobalLayout.module.css';
import { PsychedelicBackground } from './PsychedelicBackground';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.shell} relative min-h-dvh p-2 sm:p-5`}>
      <PsychedelicBackground />
      <CutoutFilter />
      <div className="relative z-[1] min-h-[calc(100dvh-16px)] overflow-hidden text-cutout-hole sm:min-h-[calc(100dvh-40px)]">
        <div
          aria-hidden="true"
          className={`${styles.stencilLayer} pointer-events-none absolute inset-0 z-0 overflow-hidden`}
          data-cutout-layer="stencil"
          data-nosnippet
          inert
        >
          <LayoutFrame>{children}</LayoutFrame>
        </div>
        <div
          className={`${styles.contentLayer} relative z-10`}
          data-cutout-layer="content"
        >
          <LayoutFrame>{children}</LayoutFrame>
        </div>
      </div>
    </div>
  );
}

function CutoutFilter() {
  return (
    <svg
      aria-hidden="true"
      className="absolute size-0 overflow-hidden"
      focusable="false"
    >
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          height="100%"
          id="global-cutout-filter"
          width="100%"
          x="0"
          y="0"
        >
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.333 0.333 0.333 0 0"
          />
        </filter>
      </defs>
    </svg>
  );
}

function LayoutFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100dvh-16px)] flex-col sm:min-h-[calc(100dvh-40px)]">
      <SiteHeader />
      <div className="flex min-h-0 flex-1 [&>*]:w-full [&>main]:min-h-0">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
