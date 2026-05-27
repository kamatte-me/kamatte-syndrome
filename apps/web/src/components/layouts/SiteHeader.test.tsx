import { cleanup, render, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SiteHeader } from './SiteHeader';

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  activeProps?: unknown;
  to: string;
};

vi.mock('@tanstack/react-router', async () => {
  const { createElement } = await import('react');

  return {
    Link: ({ activeProps: _activeProps, to, ...props }: MockLinkProps) =>
      createElement('a', { ...props, href: to }),
    useNavigate: () => vi.fn(),
  };
});

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

function requireElement<T extends Element>(element: T | null): T {
  if (!element) {
    throw new Error('Expected element to exist');
  }

  return element;
}

afterEach(() => {
  cleanup();
  setWindowScrollY(0);
});

describe('SiteHeader', () => {
  it('marks the header while it is stuck to the viewport top', async () => {
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

    const { container, unmount } = render(
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

    headerTop = 0;
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(header).toHaveAttribute('data-site-header-stuck');
    });

    unmount();
    getBoundingClientRect.mockRestore();
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

    const { container, unmount } = render(
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

    const { container, unmount } = render(
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
