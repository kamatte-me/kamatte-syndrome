import { Link, useNavigate } from '@tanstack/react-router';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import closeFillIcon from '@/assets/icons/close_fill.svg';
import menuFillIcon from '@/assets/icons/menu_fill.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/classNames';
import { PsychedelicBackground } from './PsychedelicBackground';
import styles from './SiteHeader.module.css';

const navigationLinks = [
  { label: 'Biography', to: '/biography' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Culture', to: '/culture' },
  { label: 'Blog', to: '/blog' },
  { label: 'Subscribe', to: '/subscribe' },
] as const;

const mobileMenuSelector = '[data-site-header-mobile-menu]';

type SiteHeaderProps = {
  cutoutLayer: 'stencil' | 'content';
  isMobileMenuOpen: boolean;
  onMobileMenuOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
};

export function SiteHeader({
  cutoutLayer,
  isMobileMenuOpen,
  onMobileMenuOpenChange,
  onNavigate,
}: SiteHeaderProps) {
  const navigationId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [stencilScrollY, setStencilScrollY] = useState<number | null>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    let updateFrame: number | null = null;

    const updateStickyState = () => {
      updateFrame = null;
      header.toggleAttribute(
        'data-site-header-stuck',
        header.getBoundingClientRect().top <= 0,
      );
    };

    const scheduleStickyStateUpdate = () => {
      if (updateFrame !== null) {
        return;
      }

      updateFrame = window.requestAnimationFrame(updateStickyState);
    };

    updateStickyState();

    window.addEventListener('resize', scheduleStickyStateUpdate);
    window.addEventListener('scroll', scheduleStickyStateUpdate, {
      passive: true,
    });
    window.visualViewport?.addEventListener(
      'resize',
      scheduleStickyStateUpdate,
    );
    window.visualViewport?.addEventListener(
      'scroll',
      scheduleStickyStateUpdate,
    );

    return () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      window.removeEventListener('resize', scheduleStickyStateUpdate);
      window.removeEventListener('scroll', scheduleStickyStateUpdate);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleStickyStateUpdate,
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        scheduleStickyStateUpdate,
      );
      header.removeAttribute('data-site-header-stuck');
    };
  }, []);

  useLayoutEffect(() => {
    if (!(cutoutLayer === 'stencil' && isMobileMenuOpen)) {
      setStencilScrollY(null);
      return;
    }

    const stencilLayer = headerRef.current?.closest<HTMLElement>(
      '[data-cutout-layer="stencil"]',
    );
    let updateFrame: number | null = null;

    const updateStencilScrollY = () => {
      updateFrame = null;
      setStencilScrollY(window.scrollY);
    };

    const scheduleStencilScrollYUpdate = () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      updateFrame = window.requestAnimationFrame(updateStencilScrollY);
    };

    updateStencilScrollY();
    stencilLayer?.setAttribute('data-cutout-mobile-menu-open', '');

    window.addEventListener('resize', scheduleStencilScrollYUpdate);
    window.addEventListener('scroll', scheduleStencilScrollYUpdate, {
      passive: true,
    });
    window.visualViewport?.addEventListener(
      'resize',
      scheduleStencilScrollYUpdate,
    );
    window.visualViewport?.addEventListener(
      'scroll',
      scheduleStencilScrollYUpdate,
    );

    return () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      window.removeEventListener('resize', scheduleStencilScrollYUpdate);
      window.removeEventListener('scroll', scheduleStencilScrollYUpdate);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleStencilScrollYUpdate,
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        scheduleStencilScrollYUpdate,
      );
      stencilLayer?.removeAttribute('data-cutout-mobile-menu-open');
    };
  }, [cutoutLayer, isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const isContentHeader = Boolean(
      headerRef.current?.closest('[data-cutout-layer="content"]'),
    );
    const sourceMenu =
      headerRef.current?.querySelector<HTMLElement>(mobileMenuSelector);

    if (!isContentHeader || !sourceMenu) {
      return;
    }

    let stencilMenu: HTMLElement | null = null;
    const getStencilMenu = () => {
      stencilMenu ??= document.querySelector<HTMLElement>(
        `[data-cutout-layer="stencil"] ${mobileMenuSelector}`,
      );

      return stencilMenu;
    };

    const syncStencilScroll = () => {
      const targetMenu = getStencilMenu();

      if (!targetMenu) {
        return;
      }

      targetMenu.scrollTop = sourceMenu.scrollTop;
      targetMenu.scrollLeft = sourceMenu.scrollLeft;
    };

    const animationFrame = window.requestAnimationFrame(syncStencilScroll);

    sourceMenu.addEventListener('scroll', syncStencilScroll, {
      passive: true,
    });
    window.addEventListener('resize', syncStencilScroll);
    window.visualViewport?.addEventListener('resize', syncStencilScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      sourceMenu.removeEventListener('scroll', syncStencilScroll);
      window.removeEventListener('resize', syncStencilScroll);
      window.visualViewport?.removeEventListener('resize', syncStencilScroll);
    };
  }, [isMobileMenuOpen]);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigate();
    void navigate({ to: '/' });
  };

  const handleNavigationKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!(isMobileMenuOpen && event.key === 'Escape')) {
      return;
    }

    event.stopPropagation();
    onMobileMenuOpenChange(false);
    menuButtonRef.current?.focus();
  };
  const navigationStyle =
    stencilScrollY === null
      ? undefined
      : ({
          '--mobile-menu-scroll-y': `${stencilScrollY}px`,
        } as CSSProperties);

  return (
    <header
      className={cn(
        styles.root,
        isMobileMenuOpen && styles.rootMenuOpen,
        'sticky top-0 z-40 shrink-0',
      )}
      data-site-header=""
      ref={headerRef}
    >
      {cutoutLayer === 'content' ? (
        <div className={styles.headerBackdrop} data-site-header-backdrop="">
          <PsychedelicBackground className={styles.headerBackdropViewport} />
        </div>
      ) : null}
      <div
        className={cn(
          styles.headerSurface,
          'relative z-10 px-[var(--site-header-x-padding)]',
        )}
      >
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-2 pt-[10px] pb-2 sm:pt-[22px] md:flex-row md:items-center md:justify-start md:gap-5 md:pb-4 lg:gap-6">
          <div className="relative flex items-center justify-center gap-4 md:justify-start">
            <a
              aria-label="ホームへ戻る"
              className="inline-flex h-[38px] w-[55px] shrink-0 items-center justify-center text-cutout-hole no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 sm:h-[72px] sm:w-[103px]"
              href="/"
              onClick={handleLogoClick}
            >
              <Icon className="size-full" src="/logo.svg" />
            </a>

            <button
              aria-controls={navigationId}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'
              }
              className={cn(
                'absolute right-0 inline-flex size-10 items-center justify-center border-0 bg-transparent p-0 text-cutout-hole focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:static md:hidden',
                isMobileMenuOpen && styles.menuButtonOpen,
              )}
              onClick={() => onMobileMenuOpenChange(!isMobileMenuOpen)}
              onKeyDown={handleNavigationKeyDown}
              ref={menuButtonRef}
              type="button"
            >
              <Icon
                className={isMobileMenuOpen ? 'size-12' : 'size-6'}
                src={isMobileMenuOpen ? closeFillIcon : menuFillIcon}
              />
            </button>
          </div>

          <nav
            aria-label="Primary navigation"
            className={cn(
              styles.navigation,
              isMobileMenuOpen && styles.navigationOpen,
              'flex-col gap-1 md:flex md:flex-row md:flex-nowrap md:items-center md:justify-start md:gap-1 lg:gap-2',
            )}
            id={navigationId}
            data-site-header-mobile-menu=""
            onKeyDown={handleNavigationKeyDown}
            style={navigationStyle}
          >
            <a
              aria-label="ホームへ戻る"
              className={cn(
                styles.menuLogoLink,
                'inline-flex h-[98px] w-[140px] shrink-0 items-center justify-center text-cutout-hole no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:hidden',
              )}
              href="/"
              onClick={handleLogoClick}
            >
              <Icon className="size-full" src="/logo.svg" />
            </a>

            {navigationLinks.map((link) => (
              <Link
                activeProps={{
                  className: cn(
                    styles.activeHeaderLink,
                    'rounded-none bg-cutout-hole text-black',
                  ),
                }}
                key={link.to}
                to={link.to}
                className={cn(
                  styles.menuLink,
                  'inline-flex min-h-10 items-center justify-center rounded-md px-2 pt-[3px] pb-1 font-bold font-display text-[1.2rem] text-cutout-hole leading-none no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 lg:text-[1.4rem]',
                )}
                onClick={onNavigate}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
