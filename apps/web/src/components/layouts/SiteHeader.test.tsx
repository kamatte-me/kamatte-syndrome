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
  it('locks the stencil layer to the viewport while the mobile menu is open', async () => {
    setWindowScrollY(4096);

    const { container, unmount } = render(
      <div data-cutout-layer="stencil">
        <SiteHeader
          cutoutLayer="stencil"
          hoveredHeaderLink={null}
          isMobileMenuOpen
          onHeaderLinkHoverChange={vi.fn()}
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
