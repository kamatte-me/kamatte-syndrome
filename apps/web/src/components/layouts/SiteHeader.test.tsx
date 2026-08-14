import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { SiteHeader } from './SiteHeader';

const DESKTOP_HEADER_MEDIA_QUERY = '(min-width: 48rem)';
const DESKTOP_HEADER_ANIMATED_ATTRIBUTE = 'data-site-header-desktop-animated';
const DESKTOP_HEADER_FLOATING_ATTRIBUTE = 'data-site-header-desktop-floating';
const DESKTOP_HEADER_REVEALED_ATTRIBUTE = 'data-site-header-desktop-revealed';
const SITE_HEADER_STUCK_ATTRIBUTE = 'data-site-header-stuck';
const DESKTOP_HEADER_REVEAL_Y_PROPERTY = '--site-header-desktop-reveal-y';

type ExpectedDesktopHeaderState = {
  isAnimated?: boolean;
  isFloating: boolean;
  isRevealed: boolean;
  isStuck: boolean;
  revealTranslateY: string;
};

function setWindowScrollY(scrollY: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
}

function createBoundingClientRect(top: number): DOMRect {
  return {
    bottom: top + 72,
    height: 72,
    left: 0,
    right: 320,
    toJSON: () => ({}),
    top,
    width: 320,
    x: 0,
    y: top,
  } as DOMRect;
}

function createRafController() {
  let nextFrameId = 1;
  const callbacks = new Map<number, FrameRequestCallback>();
  const requestAnimationFrame = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      callbacks.set(frameId, callback);

      return frameId;
    });
  const cancelAnimationFrame = vi
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation((frameId) => {
      callbacks.delete(frameId);
    });

  return {
    flushFrame() {
      const pendingCallbacks = Array.from(callbacks.values());
      callbacks.clear();

      for (const callback of pendingCallbacks) {
        callback(performance.now());
      }
    },
    restore() {
      callbacks.clear();
      requestAnimationFrame.mockRestore();
      cancelAnimationFrame.mockRestore();
    },
  };
}

function mockHeaderRectFromScrollY(headerDocumentTop = 0) {
  return vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function getMockBoundingClientRect(this: HTMLElement) {
      if (this.matches('[data-site-header]')) {
        return createBoundingClientRect(headerDocumentTop - window.scrollY);
      }

      return createBoundingClientRect(0);
    });
}

function mockDesktopHeaderMediaQuery(matches: boolean) {
  const originalMatchMedia = window.matchMedia;
  const mediaQueryList = {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    matches,
    media: DESKTOP_HEADER_MEDIA_QUERY,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  } as MediaQueryList;

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => mediaQueryList),
  });

  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  };
}

function requireElement<T extends Element>(element: T | null): T {
  if (!element) {
    throw new Error('Expected element to exist');
  }

  return element;
}

function expectDesktopHeaderState(
  header: HTMLElement,
  {
    isAnimated,
    isFloating,
    isRevealed,
    isStuck,
    revealTranslateY,
  }: ExpectedDesktopHeaderState,
) {
  if (isAnimated !== undefined) {
    expect(header.hasAttribute(DESKTOP_HEADER_ANIMATED_ATTRIBUTE)).toBe(
      isAnimated,
    );
  }

  expect(header.hasAttribute(DESKTOP_HEADER_FLOATING_ATTRIBUTE)).toBe(
    isFloating,
  );
  expect(header.hasAttribute(DESKTOP_HEADER_REVEALED_ATTRIBUTE)).toBe(
    isRevealed,
  );
  expect(header.hasAttribute(SITE_HEADER_STUCK_ATTRIBUTE)).toBe(isStuck);
  expect(header.style.getPropertyValue(DESKTOP_HEADER_REVEAL_Y_PROPERTY)).toBe(
    revealTranslateY,
  );
}

afterEach(() => {
  setWindowScrollY(0);
});

describe('SiteHeader', () => {
  it('marks the mobile header while it is stuck to the viewport top', async () => {
    const restoreMatchMedia = mockDesktopHeaderMediaQuery(false);
    let headerTop = 8;
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getMockBoundingClientRect(
        this: HTMLElement,
      ) {
        if (this.matches('[data-site-header]')) {
          return createBoundingClientRect(headerTop);
        }

        return createBoundingClientRect(0);
      });

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    expect(header).not.toHaveAttribute('data-site-header-stuck');

    try {
      headerTop = 0;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(header).toHaveAttribute('data-site-header-stuck');
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      restoreMatchMedia();
    }
  });

  it('reveals and hides the desktop header on scroll direction changes', () => {
    const raf = createRafController();
    const restoreMatchMedia = mockDesktopHeaderMediaQuery(true);
    setWindowScrollY(160);
    const getBoundingClientRect = mockHeaderRectFromScrollY(72);

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      setWindowScrollY(128);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: true,
        isStuck: true,
        revealTranslateY: '0px',
      });

      setWindowScrollY(140);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      setWindowScrollY(72);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: false,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '',
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      raf.restore();
      restoreMatchMedia();
    }
  });

  it('keeps the desktop floating header hidden while scrolling down from the top', () => {
    const raf = createRafController();
    const restoreMatchMedia = mockDesktopHeaderMediaQuery(true);
    setWindowScrollY(0);
    const getBoundingClientRect = mockHeaderRectFromScrollY();

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      expectDesktopHeaderState(header, {
        isFloating: false,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '',
      });

      setWindowScrollY(88);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      raf.restore();
      restoreMatchMedia();
    }
  });

  it('animates the first desktop reveal after scrolling up from the top', () => {
    const raf = createRafController();
    const restoreMatchMedia = mockDesktopHeaderMediaQuery(true);
    setWindowScrollY(0);
    const getBoundingClientRect = mockHeaderRectFromScrollY();

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      expectDesktopHeaderState(header, {
        isFloating: false,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '',
      });

      setWindowScrollY(120);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      setWindowScrollY(104);
      window.dispatchEvent(new Event('scroll'));

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: true,
        isStuck: true,
        revealTranslateY: '0px',
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      raf.restore();
      restoreMatchMedia();
    }
  });

  it('keeps the reveal animation after returning to the top and scrolling again', () => {
    const raf = createRafController();
    const restoreMatchMedia = mockDesktopHeaderMediaQuery(true);
    setWindowScrollY(0);
    const getBoundingClientRect = mockHeaderRectFromScrollY();

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      setWindowScrollY(120);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();

      setWindowScrollY(104);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();
      raf.flushFrame();
      raf.flushFrame();

      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: true,
        isStuck: true,
        revealTranslateY: '0px',
      });

      setWindowScrollY(130);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();

      setWindowScrollY(0);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();

      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: false,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '',
      });

      setWindowScrollY(120);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();

      setWindowScrollY(104);
      window.dispatchEvent(new Event('scroll'));
      raf.flushFrame();

      expectDesktopHeaderState(header, {
        isAnimated: false,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: false,
        isStuck: false,
        revealTranslateY: '-73px',
      });

      raf.flushFrame();
      expectDesktopHeaderState(header, {
        isAnimated: true,
        isFloating: true,
        isRevealed: true,
        isStuck: true,
        revealTranslateY: '0px',
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      raf.restore();
      restoreMatchMedia();
    }
  });

  it('does not write scroll offsets to the content backdrop', async () => {
    const originalVisualViewport = window.visualViewport;
    const visualViewport = new EventTarget();
    let headerTop = 0;
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getMockBoundingClientRect(
        this: HTMLElement,
      ) {
        if (this.matches('[data-site-header]')) {
          return createBoundingClientRect(headerTop);
        }

        return createBoundingClientRect(0);
      });

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    });

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="content">
        <SiteHeader
          cutoutLayer="content"
          isMobileMenuOpen={false}
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const header = requireElement(
      container.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      headerTop = -24;
      visualViewport.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      expect(header.style.getPropertyValue('--site-header-viewport-x')).toBe(
        '',
      );
      expect(header.style.getPropertyValue('--site-header-viewport-y')).toBe(
        '',
      );
      expect(
        header.style.getPropertyValue('--site-header-background-width'),
      ).toBe('');
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
    }
  });

  it('locks the stencil layer to the viewport while the mobile menu is open', async () => {
    setWindowScrollY(4096);

    const { container, unmount } = renderWithRouter(
      <div data-cutout-layer="stencil">
        <SiteHeader
          cutoutLayer="stencil"
          isMobileMenuOpen
          onMobileMenuOpenChange={vi.fn()}
          onNavigate={vi.fn()}
        />
      </div>,
    );

    const stencilLayer = requireElement(
      container.querySelector<HTMLElement>('[data-cutout-layer="stencil"]'),
    );
    const mobileMenu = requireElement(
      container.querySelector<HTMLElement>('[data-site-header-mobile-menu]'),
    );

    await waitFor(() => {
      expect(stencilLayer).toHaveAttribute('data-cutout-mobile-menu-open');
      expect(mobileMenu.style.getPropertyValue('--mobile-menu-scroll-y')).toBe(
        '4096px',
      );
    });

    setWindowScrollY(5120);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(mobileMenu.style.getPropertyValue('--mobile-menu-scroll-y')).toBe(
        '5120px',
      );
    });

    unmount();

    expect(stencilLayer).not.toHaveAttribute('data-cutout-mobile-menu-open');
  });
});
