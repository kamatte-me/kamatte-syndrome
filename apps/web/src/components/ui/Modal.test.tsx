import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal, modalDialogSelector } from './Modal';

function setWindowScrollY(scrollY: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
}

function nextAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function createBoundingClientRect({
  height,
  left,
  top,
  width,
}: {
  height: number;
  left: number;
  top: number;
  width: number;
}): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    toJSON: () => ({}),
    top,
    width,
    x: left,
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
  document.body.style.overflow = '';
  setWindowScrollY(0);
});

describe('Modal', () => {
  it('renders as a content-layer dialog and handles close interactions', async () => {
    const onClose = vi.fn();

    render(
      <div data-cutout-layer="content">
        <Modal onClose={onClose} titleId="modal-title">
          {({ isContentLayer }) => (
            <h2 id="modal-title">
              {isContentLayer ? 'Content modal' : 'Stencil modal'}
            </h2>
          )}
        </Modal>
      </div>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Content modal' });

    expect(dialog).toHaveAttribute('data-ui-modal-dialog');
    expect(dialog).toHaveFocus();
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'モーダルを閉じる' })[0],
    );
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'モーダルを閉じる' })[1],
    );
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('keeps stencil-layer rendering non-interactive and syncs the scroll offset CSS variable', async () => {
    setWindowScrollY(128);

    const { container } = render(
      <div data-cutout-layer="stencil">
        <Modal onClose={vi.fn()} titleId="modal-title">
          {({ isContentLayer }) => (
            <h2 id="modal-title">
              {isContentLayer ? 'Content modal' : 'Stencil modal'}
            </h2>
          )}
        </Modal>
      </div>,
    );

    const dialog = requireElement(
      container.querySelector('[data-ui-modal-dialog]'),
    );
    const root = requireElement(dialog.parentElement);
    const stencilLayer = requireElement(
      container.querySelector<HTMLElement>('[data-cutout-layer="stencil"]'),
    );

    expect(dialog).toHaveTextContent('Stencil modal');
    expect(root.style.getPropertyValue('--modal-scroll-y')).toBe('128px');
    expect(stencilLayer).toHaveAttribute('data-cutout-modal-open');
    expect(
      stencilLayer.style.getPropertyValue('--cutout-stencil-scroll-y'),
    ).toBe('128px');
    expect(document.body.style.overflow).toBe('');

    setWindowScrollY(240);

    window.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(root.style.getPropertyValue('--modal-scroll-y')).toBe('240px');
      expect(
        stencilLayer.style.getPropertyValue('--cutout-stencil-scroll-y'),
      ).toBe('240px');
    });
  });

  it('syncs modal body scrolling from the content layer to the stencil layer', async () => {
    render(
      <>
        <div data-cutout-layer="stencil">
          <Modal onClose={vi.fn()} titleId="stencil-title">
            <h2 id="stencil-title">Stencil modal</h2>
          </Modal>
        </div>
        <div data-cutout-layer="content">
          <Modal onClose={vi.fn()} titleId="content-title">
            <h2 id="content-title">Content modal</h2>
          </Modal>
        </div>
      </>,
    );

    const stencilBody = requireElement(
      document.querySelector<HTMLElement>(
        `[data-cutout-layer="stencil"] [data-ui-modal-body]`,
      ),
    );
    const contentBody = requireElement(
      document.querySelector<HTMLElement>(
        `[data-cutout-layer="content"] [data-ui-modal-body]`,
      ),
    );

    await nextAnimationFrame();

    contentBody.scrollTop = 72;
    contentBody.scrollLeft = 12;
    fireEvent.scroll(contentBody);

    expect(stencilBody.scrollTop).toBe(72);
    expect(stencilBody.scrollLeft).toBe(12);
  });

  it('exports the dialog selector used by route-level mask synchronization', () => {
    const { container } = render(
      <div data-cutout-layer="content">
        <Modal onClose={vi.fn()} titleId="modal-title">
          <h2 id="modal-title">Content modal</h2>
        </Modal>
      </div>,
    );

    expect(container.querySelector(modalDialogSelector)).toBe(
      screen.getByRole('dialog', { name: 'Content modal' }),
    );
  });

  it('sets the content header cutout mask to the modal overlap area', async () => {
    const getBoundingClientRect = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getMockBoundingClientRect(
        this: HTMLElement,
      ) {
        if (this.matches('[data-site-header]')) {
          return createBoundingClientRect({
            height: 80,
            left: 0,
            top: 0,
            width: 320,
          });
        }

        if (this.matches(modalDialogSelector)) {
          return createBoundingClientRect({
            height: 160,
            left: 40,
            top: 24,
            width: 220,
          });
        }

        return createBoundingClientRect({
          height: 0,
          left: 0,
          top: 0,
          width: 0,
        });
      });

    const { unmount } = render(
      <div data-cutout-layer="content">
        <header data-site-header="" />
        <Modal onClose={vi.fn()} titleId="modal-title">
          <h2 id="modal-title">Content modal</h2>
        </Modal>
      </div>,
    );

    const header = requireElement(
      document.querySelector<HTMLElement>('[data-site-header]'),
    );

    try {
      await waitFor(() => {
        expect(header).toHaveAttribute('data-site-header-modal-cutout', 'true');
        expect(
          header.style.getPropertyValue('--site-header-modal-mask-height'),
        ).toBe('56px');
        expect(
          header.style.getPropertyValue('--site-header-modal-mask-left'),
        ).toBe('40px');
        expect(
          header.style.getPropertyValue('--site-header-modal-mask-top'),
        ).toBe('24px');
        expect(
          header.style.getPropertyValue('--site-header-modal-mask-width'),
        ).toBe('220px');
      });
    } finally {
      unmount();
      getBoundingClientRect.mockRestore();
    }
  });
});
