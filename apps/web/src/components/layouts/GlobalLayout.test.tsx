import { describe, expect, it, vi } from 'vitest';
import { renderWithRouter } from '@/testing/renderWithRouter';
import { GlobalLayout } from './GlobalLayout';

vi.mock('./PsychedelicBackground', () => ({
  PsychedelicBackground: () => <div data-testid="psychedelic-background" />,
}));

function mockMatchMedia() {
  const originalMatchMedia = window.matchMedia;
  const mediaQueryList = {
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
    matches: false,
    media: '(min-width: 48rem)',
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

describe('GlobalLayout', () => {
  it('renders separate decorative and interactive layout layers', () => {
    const restoreMatchMedia = mockMatchMedia();

    try {
      const { container } = renderWithRouter(
        <GlobalLayout>
          <main>
            <p>Page content</p>
          </main>
        </GlobalLayout>,
      );

      const stencil = container.querySelector('[data-cutout-layer="stencil"]');
      const modalStencil = container.querySelector(
        '[data-cutout-layer="modal-stencil"]',
      );
      const content = container.querySelector('[data-cutout-layer="content"]');

      expect(
        container.querySelector('[data-testid="psychedelic-background"]'),
      ).toBeInTheDocument();
      expect(stencil).toHaveAttribute('aria-hidden', 'true');
      expect(stencil).toHaveAttribute('data-nosnippet');
      expect(modalStencil).toHaveAttribute('aria-hidden', 'true');
      expect(content).toBeInTheDocument();
      expect(container.querySelectorAll('p')).toHaveLength(4);
      expect(
        container.querySelector('#global-cutout-filter'),
      ).toBeInTheDocument();
      expect(
        container.querySelector('#site-header-cutout-filter'),
      ).toBeInTheDocument();
    } finally {
      restoreMatchMedia();
    }
  });
});
