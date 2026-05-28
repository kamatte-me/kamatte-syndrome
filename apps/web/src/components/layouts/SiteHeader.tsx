import { Link, useNavigate } from '@tanstack/react-router';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
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
import { addViewportListeners, createRafScheduler } from '@/utils/viewportRaf';
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

    const updateStickyState = () => {
      header.toggleAttribute(
        'data-site-header-stuck',
        header.getBoundingClientRect().top <= 0,
      );
    };
    const stickyStateScheduler = createRafScheduler(updateStickyState);

    updateStickyState();

    const removeViewportListeners = addViewportListeners(
      stickyStateScheduler.schedule,
    );

    return () => {
      stickyStateScheduler.cancel();
      removeViewportListeners();
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

    const updateStencilScrollY = () => {
      setStencilScrollY(window.scrollY);
    };
    const stencilScrollYScheduler = createRafScheduler(updateStencilScrollY, {
      replacePending: true,
    });

    updateStencilScrollY();
    stencilLayer?.setAttribute('data-cutout-mobile-menu-open', '');

    const removeViewportListeners = addViewportListeners(
      stencilScrollYScheduler.schedule,
    );

    return () => {
      stencilScrollYScheduler.cancel();
      removeViewportListeners();
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
    const removeViewportListeners = addViewportListeners(syncStencilScroll, {
      visualViewportScroll: false,
      windowScroll: false,
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      sourceMenu.removeEventListener('scroll', syncStencilScroll);
      removeViewportListeners();
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
      <HeaderBackdrop cutoutLayer={cutoutLayer} />
      <div
        className={cn(
          styles.headerSurface,
          'relative z-10 px-[var(--site-header-x-padding)]',
        )}
      >
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-2 pt-[10px] pb-2 sm:pt-[22px] md:flex-row md:items-center md:justify-start md:gap-5 md:pb-4 lg:gap-6">
          <div className="relative flex items-center justify-center gap-4 md:justify-start">
            <HeaderLogoLink
              className="inline-flex h-[38px] w-[55px] shrink-0 items-center justify-center text-cutout-hole no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 sm:h-[72px] sm:w-[103px]"
              onClick={handleLogoClick}
            />

            <MobileMenuButton
              buttonRef={menuButtonRef}
              isMobileMenuOpen={isMobileMenuOpen}
              navigationId={navigationId}
              onKeyDown={handleNavigationKeyDown}
              onToggle={() => onMobileMenuOpenChange(!isMobileMenuOpen)}
            />
          </div>

          <HeaderNavigation
            isMobileMenuOpen={isMobileMenuOpen}
            navigationId={navigationId}
            navigationStyle={navigationStyle}
            onKeyDown={handleNavigationKeyDown}
            onLogoClick={handleLogoClick}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </header>
  );
}

function HeaderBackdrop({
  cutoutLayer,
}: {
  cutoutLayer: 'stencil' | 'content';
}) {
  if (cutoutLayer !== 'content') {
    return null;
  }

  return (
    <div className={styles.headerBackdrop} data-site-header-backdrop="">
      <PsychedelicBackground className={styles.headerBackdropViewport} />
    </div>
  );
}

function HeaderLogoLink({
  className,
  onClick,
}: {
  className: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      aria-label="ホームへ戻る"
      className={className}
      href="/"
      onClick={onClick}
    >
      <Icon className="size-full" src="/logo.svg" />
    </a>
  );
}

function MobileMenuButton({
  buttonRef,
  isMobileMenuOpen,
  navigationId,
  onKeyDown,
  onToggle,
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  isMobileMenuOpen: boolean;
  navigationId: string;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onToggle: () => void;
}) {
  return (
    <button
      aria-controls={navigationId}
      aria-expanded={isMobileMenuOpen}
      aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
      className={cn(
        'absolute right-0 inline-flex size-10 items-center justify-center border-0 bg-transparent p-0 text-cutout-hole focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:static md:hidden',
        isMobileMenuOpen && styles.menuButtonOpen,
      )}
      onClick={onToggle}
      onKeyDown={onKeyDown}
      ref={buttonRef}
      type="button"
    >
      <Icon
        className={isMobileMenuOpen ? 'size-12' : 'size-6'}
        src={isMobileMenuOpen ? closeFillIcon : menuFillIcon}
      />
    </button>
  );
}

function HeaderNavigation({
  isMobileMenuOpen,
  navigationId,
  navigationStyle,
  onKeyDown,
  onLogoClick,
  onNavigate,
}: {
  isMobileMenuOpen: boolean;
  navigationId: string;
  navigationStyle: CSSProperties | undefined;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onLogoClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onNavigate: () => void;
}) {
  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        styles.navigation,
        isMobileMenuOpen && styles.navigationOpen,
        'flex-col gap-1 md:flex md:flex-row md:flex-nowrap md:items-center md:justify-start md:gap-1 lg:gap-2',
      )}
      id={navigationId}
      data-site-header-mobile-menu=""
      onKeyDown={onKeyDown}
      style={navigationStyle}
    >
      <HeaderLogoLink
        className={cn(
          styles.menuLogoLink,
          'inline-flex h-[98px] w-[140px] shrink-0 items-center justify-center text-cutout-hole no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 md:hidden',
        )}
        onClick={onLogoClick}
      />

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
  );
}
