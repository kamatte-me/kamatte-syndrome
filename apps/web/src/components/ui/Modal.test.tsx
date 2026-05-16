import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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

function requireElement<T extends Element>(element: T | null): T {
  if (!element) {
    throw new Error('Expected element to exist');
  }

  return element;
}

afterEach(() => {
  cleanup();
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

    expect(dialog).toHaveTextContent('Stencil modal');
    expect(root.style.getPropertyValue('--modal-scroll-y')).toBe('128px');
    expect(document.body.style.overflow).toBe('');

    setWindowScrollY(240);

    window.dispatchEvent(new Event('scroll'));
    await waitFor(() => {
      expect(root.style.getPropertyValue('--modal-scroll-y')).toBe('240px');
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
});
