import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { act, useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageLightbox } from './ImageLightbox';

const zoomViewerMock = vi.hoisted(() => ({
  onBackdropOpacityChange: null as ((opacity: number) => void) | null,
  onImageErrorChange: null as ((hasError: boolean) => void) | null,
  onImageLoadingChange: null as ((isLoading: boolean) => void) | null,
}));

vi.mock('./ImageZoomViewer', () => ({
  ImageZoomViewer: ({
    alt,
    height,
    onBackdropOpacityChange,
    onImageErrorChange,
    onImageLoadingChange,
    src,
    width,
  }: {
    alt: string;
    height: number;
    onBackdropOpacityChange: (opacity: number) => void;
    onImageErrorChange: (hasError: boolean) => void;
    onImageLoadingChange: (isLoading: boolean) => void;
    src: string;
    width: number;
  }) => {
    zoomViewerMock.onBackdropOpacityChange = onBackdropOpacityChange;
    zoomViewerMock.onImageErrorChange = onImageErrorChange;
    zoomViewerMock.onImageLoadingChange = onImageLoadingChange;

    return (
      // biome-ignore lint/a11y/noNoninteractiveTabindex: This test double represents the keyboard-operable image viewer.
      <section aria-label="画像ズームビューアー" tabIndex={0}>
        <span data-image-lightbox-loading-icon="" />
        <img src={src} alt={alt} height={height} width={width} />
      </section>
    );
  },
}));

let pageStencilTarget: HTMLDivElement;

beforeEach(() => {
  zoomViewerMock.onBackdropOpacityChange = null;
  zoomViewerMock.onImageErrorChange = null;
  zoomViewerMock.onImageLoadingChange = null;
  pageStencilTarget = document.createElement('div');
  pageStencilTarget.dataset.cutoutLayer = 'stencil';
  pageStencilTarget.setAttribute('aria-hidden', 'true');
  pageStencilTarget.inert = true;
  document.body.append(pageStencilTarget);
});

afterEach(() => {
  pageStencilTarget.remove();
});

function nextAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

function LightboxFocusFixture() {
  const openerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div data-cutout-layer="content">
        <button ref={openerRef} type="button" onClick={() => setIsOpen(true)}>
          画像を開く
        </button>
        {isOpen ? (
          <ImageLightbox
            alt="元画像"
            height={600}
            onClose={() => setIsOpen(false)}
            returnFocusElement={openerRef.current}
            src="/media/original.jpg"
            width={800}
          />
        ) : null}
      </div>
      <button type="button">外部操作</button>
    </>
  );
}

describe('ImageLightbox', () => {
  it('renders one accessible dialog without a duplicated visual stencil', async () => {
    render(
      <div data-cutout-layer="content">
        <ImageLightbox
          alt="元画像"
          height={600}
          onClose={vi.fn()}
          returnFocusElement={null}
          src="/media/original.jpg"
          width={800}
        />
      </div>,
    );

    const dialog = screen.getByRole('dialog', { name: '画像の拡大表示' });
    const image = await within(dialog).findByRole('img', { name: '元画像' });
    const closeButton = within(dialog).getByRole('button', {
      name: '画像の拡大表示を閉じる',
    });
    const errorIcon = dialog.querySelector('[data-image-lightbox-error-icon]');
    const stencilOverlay = document.querySelector(
      '[data-image-lightbox-layer="stencil"]',
    );

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(image).toHaveAttribute('src', '/media/original.jpg');
    expect(image).not.toHaveAttribute('srcset');
    expect(image).not.toHaveAttribute('sizes');
    expect(within(dialog).getAllByRole('button')).toEqual([closeButton]);
    expect(closeButton).toHaveAttribute('data-image-lightbox-close');
    expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
    expect(within(dialog).queryByRole('toolbar')).not.toBeInTheDocument();
    expect(stencilOverlay).toBeNull();
    expect(pageStencilTarget).toHaveAttribute(
      'data-image-lightbox-close-cutout',
    );
    expect(document.body.className).not.toContain('loadingActive');
    expect(document.body.className).not.toContain('errorActive');

    act(() => {
      zoomViewerMock.onImageErrorChange?.(true);
    });

    expect(document.body.className).toContain('errorActive');

    act(() => {
      zoomViewerMock.onImageErrorChange?.(false);
    });

    expect(document.body.className).not.toContain('errorActive');

    act(() => {
      zoomViewerMock.onImageLoadingChange?.(true);
    });

    expect(document.body.className).toContain('loadingActive');

    act(() => {
      zoomViewerMock.onImageLoadingChange?.(false);
    });

    expect(document.body.className).not.toContain('loadingActive');
  });

  it('locks and hides the page content while open, then restores it', () => {
    const view = render(
      <div data-cutout-layer="content" aria-hidden="false">
        <ImageLightbox
          alt="元画像"
          height={600}
          onClose={vi.fn()}
          returnFocusElement={null}
          src="/media/original.jpg"
          width={800}
        />
      </div>,
    );
    const contentLayer = view.container.querySelector<HTMLElement>(
      '[data-cutout-layer="content"]',
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(contentLayer).toHaveAttribute('aria-hidden', 'true');
    expect(contentLayer?.inert).toBe(true);
    expect(contentLayer).toHaveAttribute('data-image-lightbox-close-cutout');

    view.unmount();

    expect(document.body.style.overflow).toBe('');
    expect(contentLayer).toHaveAttribute('aria-hidden', 'false');
    expect(contentLayer?.inert).toBe(false);
    expect(contentLayer).not.toHaveAttribute(
      'data-image-lightbox-close-cutout',
    );
    expect(pageStencilTarget).not.toHaveAttribute(
      'data-image-lightbox-close-cutout',
    );
  });

  it('keeps the close cutout opacity in sync without rerendering', () => {
    const view = render(
      <div data-cutout-layer="content">
        <ImageLightbox
          alt="元画像"
          height={600}
          onClose={vi.fn()}
          returnFocusElement={null}
          src="/media/original.jpg"
          width={800}
        />
      </div>,
    );
    const dialog = screen.getByRole('dialog', { name: '画像の拡大表示' });
    const contentLayer = view.container.querySelector<HTMLElement>(
      '[data-cutout-layer="content"]',
    );

    act(() => {
      zoomViewerMock.onBackdropOpacityChange?.(0.4);
    });

    for (const target of [dialog, contentLayer, pageStencilTarget]) {
      expect(target).toHaveStyle({
        '--image-lightbox-close-opacity': '0.4',
      });
    }

    act(() => {
      zoomViewerMock.onBackdropOpacityChange?.(0);
    });

    for (const target of [dialog, contentLayer, pageStencilTarget]) {
      expect(target).toHaveStyle({
        '--image-lightbox-close-opacity': '0',
      });
    }
  });

  it('closes on touch release without waiting for a synthesized click', async () => {
    const onClose = vi.fn();

    render(
      <div data-cutout-layer="content">
        <ImageLightbox
          alt="元画像"
          height={600}
          onClose={onClose}
          returnFocusElement={null}
          src="/media/original.jpg"
          width={800}
        />
      </div>,
    );

    const closeButton = screen.getByRole('button', {
      name: '画像の拡大表示を閉じる',
    });

    vi.spyOn(closeButton, 'getBoundingClientRect').mockReturnValue({
      bottom: 60,
      height: 48,
      left: 12,
      right: 60,
      top: 12,
      width: 48,
      x: 12,
      y: 12,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(closeButton, {
      clientX: 36,
      clientY: 36,
      pointerId: 1,
      pointerType: 'touch',
    });
    fireEvent.pointerUp(closeButton, {
      clientX: 36,
      clientY: 36,
      pointerId: 1,
      pointerType: 'touch',
    });

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('closes with Escape, traps focus, and restores the opener', async () => {
    render(<LightboxFocusFixture />);

    const opener = screen.getByRole('button', { name: '画像を開く' });
    const externalButton = screen.getByRole('button', { name: '外部操作' });

    opener.focus();
    fireEvent.click(opener);

    const dialog = await screen.findByRole('dialog', {
      name: '画像の拡大表示',
    });
    const viewer = await within(dialog).findByRole('region', {
      name: '画像ズームビューアー',
    });
    const closeButton = within(dialog).getByRole('button', {
      name: '画像の拡大表示を閉じる',
    });

    externalButton.focus();
    expect(closeButton).toHaveFocus();

    viewer.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(viewer).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    await nextAnimationFrame();

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });
});
