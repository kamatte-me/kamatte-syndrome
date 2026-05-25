import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/utils/classNames';
import styles from './GlobalLayout.module.css';
import { PsychedelicBackground } from './PsychedelicBackground';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function GlobalLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredHeaderLink, setHoveredHeaderLink] = useState<string | null>(
    null,
  );
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setHoveredHeaderLink(null);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 48rem)');
    const closeDesktopMenu = () => {
      if (mediaQuery.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    closeDesktopMenu();
    mediaQuery.addEventListener('change', closeDesktopMenu);

    return () => {
      mediaQuery.removeEventListener('change', closeDesktopMenu);
    };
  }, []);

  return (
    <div className={cn(styles.shell, 'relative min-h-dvh p-2 sm:p-5')}>
      <PsychedelicBackground />
      <CutoutFilter />
      <div className="relative z-[1] min-h-[calc(100dvh-16px)] overflow-clip text-cutout-hole sm:min-h-[calc(100dvh-40px)]">
        <div
          aria-hidden="true"
          className={cn(
            styles.stencilLayer,
            'pointer-events-none absolute inset-0 z-0 overflow-clip',
          )}
          data-cutout-layer="stencil"
          data-nosnippet
          inert
        >
          <LayoutFrame
            cutoutLayer="stencil"
            isMobileMenuOpen={isMobileMenuOpen}
            hoveredHeaderLink={hoveredHeaderLink}
            onMobileMenuOpenChange={setIsMobileMenuOpen}
            onHeaderLinkHoverChange={setHoveredHeaderLink}
            onNavigate={closeMobileMenu}
          >
            {children}
          </LayoutFrame>
        </div>
        <div
          className={cn(styles.contentLayer, 'relative z-10')}
          data-cutout-layer="content"
        >
          <LayoutFrame
            cutoutLayer="content"
            isMobileMenuOpen={isMobileMenuOpen}
            hoveredHeaderLink={hoveredHeaderLink}
            onMobileMenuOpenChange={setIsMobileMenuOpen}
            onHeaderLinkHoverChange={setHoveredHeaderLink}
            onNavigate={closeMobileMenu}
          >
            {children}
          </LayoutFrame>
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

function LayoutFrame({
  children,
  cutoutLayer,
  isMobileMenuOpen,
  hoveredHeaderLink,
  onMobileMenuOpenChange,
  onHeaderLinkHoverChange,
  onNavigate,
}: {
  children: ReactNode;
  cutoutLayer: 'stencil' | 'content';
  isMobileMenuOpen: boolean;
  hoveredHeaderLink: string | null;
  onMobileMenuOpenChange: (isOpen: boolean) => void;
  onHeaderLinkHoverChange: (to: string | null) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-16px)] flex-col sm:min-h-[calc(100dvh-40px)]">
      <SiteHeader
        cutoutLayer={cutoutLayer}
        isMobileMenuOpen={isMobileMenuOpen}
        hoveredHeaderLink={hoveredHeaderLink}
        onMobileMenuOpenChange={onMobileMenuOpenChange}
        onHeaderLinkHoverChange={onHeaderLinkHoverChange}
        onNavigate={onNavigate}
      />
      <div
        className={cn(
          'flex min-h-0 flex-1 [&>*]:w-full [&>main]:min-h-0',
          isMobileMenuOpen && styles.mobileMenuSuppressed,
        )}
        inert={isMobileMenuOpen ? true : undefined}
      >
        {children}
      </div>
      <div
        className={cn(isMobileMenuOpen && styles.mobileMenuSuppressed)}
        inert={isMobileMenuOpen ? true : undefined}
      >
        <SiteFooter />
      </div>
    </div>
  );
}
