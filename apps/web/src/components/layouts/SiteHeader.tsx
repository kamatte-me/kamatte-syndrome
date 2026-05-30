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
const DESKTOP_HEADER_MEDIA_QUERY = '(min-width: 48rem)';
const DESKTOP_HEADER_HIDDEN_OFFSET_GUARD = 1;
const DESKTOP_HEADER_ANIMATED_ATTRIBUTE = 'data-site-header-desktop-animated';
const DESKTOP_HEADER_FLOATING_ATTRIBUTE = 'data-site-header-desktop-floating';
const DESKTOP_HEADER_REVEALED_ATTRIBUTE = 'data-site-header-desktop-revealed';
const SITE_HEADER_STUCK_ATTRIBUTE = 'data-site-header-stuck';
const DESKTOP_HEADER_REVEAL_Y_PROPERTY = '--site-header-desktop-reveal-y';

type DesktopHeaderVisibility = 'normal' | 'hidden' | 'revealed';

type DesktopHeaderScrollActionInput = {
  currentScrollY: number;
  headerDocumentTop: number;
  headerHeight: number;
  previousScrollY: number;
  visibility: DesktopHeaderVisibility;
};

type DesktopHeaderScrollAction =
  | 'clear'
  | 'hide'
  | 'none'
  | 'prepare-hidden'
  | 'reveal';

type SiteHeaderProps = {
  cutoutLayer: 'stencil' | 'content';
  isMobileMenuOpen: boolean;
  onMobileMenuOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
};

function getDesktopHeaderScrollAction({
  currentScrollY,
  headerDocumentTop,
  headerHeight,
  previousScrollY,
  visibility,
}: DesktopHeaderScrollActionInput): DesktopHeaderScrollAction {
  if (currentScrollY <= headerDocumentTop) {
    return 'clear';
  }

  const scrollDelta = currentScrollY - previousScrollY;
  const isNormalHeaderFullyHidden =
    currentScrollY >= headerDocumentTop + headerHeight;

  if (scrollDelta < 0) {
    if (visibility === 'revealed') {
      return 'none';
    }

    if (visibility === 'normal' && !isNormalHeaderFullyHidden) {
      return 'clear';
    }

    return 'reveal';
  }

  if (scrollDelta > 0) {
    if (visibility === 'revealed') {
      return 'hide';
    }

    if (isNormalHeaderFullyHidden) {
      return 'prepare-hidden';
    }

    return 'clear';
  }

  if (visibility === 'normal' && isNormalHeaderFullyHidden) {
    return 'prepare-hidden';
  }

  return 'none';
}

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

    const desktopMediaQuery = window.matchMedia?.(DESKTOP_HEADER_MEDIA_QUERY);
    let previousScrollY = Math.max(0, window.scrollY);
    const desktopHeaderDocumentTop = Math.max(
      0,
      header.getBoundingClientRect().top + previousScrollY,
    );
    let desktopHeaderVisibility: DesktopHeaderVisibility = 'normal';

    const isDesktopViewport = () =>
      desktopMediaQuery?.matches ?? window.innerWidth >= 768;

    let desktopRevealFirstAnimationFrame: number | null = null;
    let desktopRevealSecondAnimationFrame: number | null = null;
    let desktopRevealAnimationPending = false;

    const cancelDesktopRevealAnimation = () => {
      if (desktopRevealFirstAnimationFrame !== null) {
        window.cancelAnimationFrame(desktopRevealFirstAnimationFrame);
        desktopRevealFirstAnimationFrame = null;
      }

      if (desktopRevealSecondAnimationFrame !== null) {
        window.cancelAnimationFrame(desktopRevealSecondAnimationFrame);
        desktopRevealSecondAnimationFrame = null;
      }

      desktopRevealAnimationPending = false;
    };

    const clearDesktopRevealState = () => {
      cancelDesktopRevealAnimation();
      desktopHeaderVisibility = 'normal';
      header.removeAttribute(DESKTOP_HEADER_ANIMATED_ATTRIBUTE);
      header.removeAttribute(DESKTOP_HEADER_FLOATING_ATTRIBUTE);
      header.removeAttribute(DESKTOP_HEADER_REVEALED_ATTRIBUTE);
      header.style.removeProperty(DESKTOP_HEADER_REVEAL_Y_PROPERTY);
    };

    const prepareDesktopHeaderHidden = (
      hiddenOffset: number,
      { animated }: { animated: boolean },
    ) => {
      cancelDesktopRevealAnimation();
      desktopHeaderVisibility = 'hidden';
      header.style.setProperty(
        DESKTOP_HEADER_REVEAL_Y_PROPERTY,
        `${-hiddenOffset}px`,
      );
      header.toggleAttribute(DESKTOP_HEADER_ANIMATED_ATTRIBUTE, animated);
      header.toggleAttribute(DESKTOP_HEADER_FLOATING_ATTRIBUTE, true);
      header.removeAttribute(DESKTOP_HEADER_REVEALED_ATTRIBUTE);
      header.removeAttribute(SITE_HEADER_STUCK_ATTRIBUTE);
    };

    const revealDesktopHeader = () => {
      desktopHeaderVisibility = 'revealed';
      header.style.setProperty(DESKTOP_HEADER_REVEAL_Y_PROPERTY, '0px');
      header.toggleAttribute(DESKTOP_HEADER_ANIMATED_ATTRIBUTE, true);
      header.toggleAttribute(DESKTOP_HEADER_FLOATING_ATTRIBUTE, true);
      header.toggleAttribute(DESKTOP_HEADER_REVEALED_ATTRIBUTE, true);
      header.toggleAttribute(SITE_HEADER_STUCK_ATTRIBUTE, true);
    };

    const scheduleDesktopHeaderReveal = (hiddenOffset: number) => {
      prepareDesktopHeaderHidden(hiddenOffset, { animated: false });
      desktopRevealAnimationPending = true;
      desktopRevealFirstAnimationFrame = window.requestAnimationFrame(() => {
        desktopRevealFirstAnimationFrame = null;

        if (!header.isConnected || desktopHeaderVisibility !== 'hidden') {
          desktopRevealAnimationPending = false;
          return;
        }

        header.toggleAttribute(DESKTOP_HEADER_ANIMATED_ATTRIBUTE, true);
        desktopRevealSecondAnimationFrame = window.requestAnimationFrame(() => {
          desktopRevealSecondAnimationFrame = null;
          desktopRevealAnimationPending = false;

          if (!header.isConnected || desktopHeaderVisibility !== 'hidden') {
            return;
          }

          revealDesktopHeader();
        });
      });
    };

    const applyDesktopHeaderScrollAction = (
      action: DesktopHeaderScrollAction,
      hiddenOffset: number,
    ) => {
      if (action === 'none') {
        return;
      }

      if (action === 'clear') {
        clearDesktopRevealState();
        header.removeAttribute(SITE_HEADER_STUCK_ATTRIBUTE);
        return;
      }

      if (action === 'prepare-hidden') {
        prepareDesktopHeaderHidden(hiddenOffset, { animated: false });
        return;
      }

      if (action === 'hide') {
        prepareDesktopHeaderHidden(hiddenOffset, { animated: true });
        return;
      }

      scheduleDesktopHeaderReveal(hiddenOffset);
    };

    const updateHeaderViewportState = () => {
      const headerRect = header.getBoundingClientRect();

      if (!isDesktopViewport()) {
        clearDesktopRevealState();
        header.toggleAttribute(
          SITE_HEADER_STUCK_ATTRIBUTE,
          headerRect.top <= 0,
        );
        previousScrollY = Math.max(0, window.scrollY);
        return;
      }

      const currentScrollY = Math.max(0, window.scrollY);
      const scrollDelta = currentScrollY - previousScrollY;
      const headerHeight = headerRect.height;
      const hiddenOffset = headerHeight + DESKTOP_HEADER_HIDDEN_OFFSET_GUARD;

      if (desktopRevealAnimationPending) {
        if (currentScrollY <= desktopHeaderDocumentTop) {
          clearDesktopRevealState();
          header.removeAttribute(SITE_HEADER_STUCK_ATTRIBUTE);
        } else if (scrollDelta > 0) {
          prepareDesktopHeaderHidden(hiddenOffset, { animated: false });
        }

        previousScrollY = currentScrollY;
        return;
      }

      const nextScrollAction = getDesktopHeaderScrollAction({
        currentScrollY,
        headerDocumentTop: desktopHeaderDocumentTop,
        headerHeight,
        previousScrollY,
        visibility: desktopHeaderVisibility,
      });

      applyDesktopHeaderScrollAction(nextScrollAction, hiddenOffset);
      previousScrollY = currentScrollY;
    };
    const headerViewportStateScheduler = createRafScheduler(
      updateHeaderViewportState,
    );

    updateHeaderViewportState();

    const removeViewportListeners = addViewportListeners(
      headerViewportStateScheduler.schedule,
    );
    desktopMediaQuery?.addEventListener(
      'change',
      headerViewportStateScheduler.schedule,
    );

    return () => {
      headerViewportStateScheduler.cancel();
      removeViewportListeners();
      desktopMediaQuery?.removeEventListener(
        'change',
        headerViewportStateScheduler.schedule,
      );
      clearDesktopRevealState();
      header.removeAttribute(SITE_HEADER_STUCK_ATTRIBUTE);
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
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-2 pt-[10px] pb-2 sm:pt-5 md:flex-row md:items-center md:justify-start md:gap-5 md:pb-4 lg:gap-6">
          <div className="relative flex items-center justify-center gap-4 md:justify-start">
            <HeaderLogoLink
              className="inline-flex h-10 w-15 shrink-0 items-center justify-center text-cutout-hole no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole focus-visible:outline-offset-4 sm:h-14 sm:w-20"
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
