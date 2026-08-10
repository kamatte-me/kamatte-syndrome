import { fireEvent, render, screen } from '@testing-library/react';
import type { PhotoSwipeOptions } from 'photoswipe';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageZoomViewer } from './ImageZoomViewer';

vi.mock(
  'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original',
  () => ({
    manifest: {
      '/media/original.jpg': {
        avif: [{ src: '/assets/original.avif', width: 1600 }],
        height: 900,
        src: '/assets/original.jpg',
        webp: [{ src: '/assets/original.webp', width: 1600 }],
        width: 1600,
      },
    },
  }),
);

const photoSwipeMock = vi.hoisted(() => {
  let instances: PhotoSwipeMock[];
  type PreventPointerEventFilter = (
    preventPointerEvent: boolean,
    event: PointerEvent,
    pointerType: string,
  ) => boolean;

  class PhotoSwipeMock {
    addFilter = vi.fn((name: string, filter: PreventPointerEventFilter) => {
      this.filters.set(name, filter);
    });
    bgOpacity = 1;
    container: HTMLElement | null = null;
    currSlide = {
      currZoomLevel: 1,
      toggleZoom: vi.fn(),
      zoomLevels: { initial: 0.5, max: 2 },
      zoomTo: vi.fn(),
    };
    destroy = vi.fn(() => {
      this.element?.remove();
    });
    close = vi.fn();
    element: HTMLElement | null = null;
    eventHandlers = new Map<string, Set<(event: unknown) => void>>();
    filters = new Map<string, PreventPointerEventFilter>();
    getViewportCenterPoint = vi.fn(() => ({ x: 320, y: 240 }));
    gestures = {
      isDragging: false,
      isMultitouch: false,
      isZooming: false,
    };
    offset = { x: 10, y: 20 };
    options: PhotoSwipeOptions;
    scrollWrap: HTMLElement | null = null;

    constructor(options: PhotoSwipeOptions) {
      this.options = options;
      instances.push(this);
    }

    init = vi.fn(() => {
      const element = document.createElement('div');
      const scrollWrap = document.createElement('div');
      const container = document.createElement('div');

      element.setAttribute('role', 'dialog');
      element.setAttribute('tabindex', '-1');
      scrollWrap.setAttribute('aria-roledescription', 'carousel');
      container.className = 'pswp__container';
      container.setAttribute('aria-live', 'off');
      scrollWrap.append(container);
      element.append(scrollWrap);
      this.options.appendToEl?.append(element);
      this.container = container;
      this.element = element;
      this.scrollWrap = scrollWrap;
      this.emit('uiRegister');
    });

    on = vi.fn((eventName: string, handler: (event: unknown) => void) => {
      const handlers = this.eventHandlers.get(eventName) ?? new Set();

      handlers.add(handler);
      this.eventHandlers.set(eventName, handlers);
    });

    emit(eventName: string, event: unknown = {}) {
      for (const handler of this.eventHandlers.get(eventName) ?? []) {
        handler(event);
      }
    }
  }

  instances = [];

  return { instances, PhotoSwipeMock };
});

vi.mock('photoswipe', () => ({
  default: photoSwipeMock.PhotoSwipeMock,
}));

type MockInstance = InstanceType<typeof photoSwipeMock.PhotoSwipeMock>;

function getInstance() {
  const instance = photoSwipeMock.instances[0];

  expect(instance).toBeDefined();

  return instance as MockInstance;
}

function renderViewer(
  onClose = vi.fn(),
  onBackdropOpacityChange = vi.fn(),
  onImageLoadingChange = vi.fn(),
  onImageErrorChange = vi.fn(),
) {
  return render(
    <ImageZoomViewer
      alt="元画像の説明"
      height={900}
      onBackdropOpacityChange={onBackdropOpacityChange}
      onClose={onClose}
      onImageErrorChange={onImageErrorChange}
      onImageLoadingChange={onImageLoadingChange}
      src="/media/original.jpg"
      width={1600}
    />,
  );
}

function emitKey(instance: MockInstance, key: string) {
  const originalEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
  });
  const preventDefault = vi.fn();

  act(() => {
    instance.emit('keydown', { originalEvent, preventDefault });
  });

  return { originalEvent, preventDefault };
}

function createDoubleClick(pageX: number, pageY: number) {
  const event = new MouseEvent('dblclick', {
    bubbles: true,
    cancelable: true,
  });

  Object.defineProperties(event, {
    pageX: { value: pageX },
    pageY: { value: pageY },
  });

  return event;
}

function nextAnimationFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

describe('ImageZoomViewer', () => {
  beforeEach(() => {
    photoSwipeMock.instances.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads original-size AVIF and WebP sources with the original fallback', () => {
    vi.useFakeTimers();
    const onImageLoadingChange = vi.fn();

    renderViewer(vi.fn(), vi.fn(), onImageLoadingChange);

    const instance = getInstance();
    const viewer = screen.getByRole('region', {
      name: '画像ズームビューアー',
    });
    const dataSource = instance.options.dataSource as Array<
      Record<string, unknown>
    >;

    expect(dataSource).toEqual([
      {
        alt: '元画像の説明',
        avifSrc: '/assets/original.avif',
        height: 900,
        src: '/assets/original.jpg',
        webpSrc: '/assets/original.webp',
        width: 1600,
      },
    ]);
    expect(dataSource[0]).not.toHaveProperty('srcset');
    expect(dataSource[0]).not.toHaveProperty('sizes');
    expect(viewer).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(
      '元画像を読み込んでいます',
    );
    expect(
      document.querySelector('[data-image-lightbox-loading-icon]'),
    ).toBeInTheDocument();

    expect(onImageLoadingChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(onImageLoadingChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onImageLoadingChange).toHaveBeenCalledWith(true);
    expect(instance.element).not.toHaveAttribute('role');
    expect(instance.element).not.toHaveAttribute('tabindex');
    expect(instance.scrollWrap).not.toHaveAttribute('aria-roledescription');
    expect(instance.container).not.toHaveAttribute('aria-live');

    const slideContainer = document.createElement('div');
    const onLoaded = vi.fn();
    const onError = vi.fn();
    const content = {
      data: dataSource[0],
      element: undefined,
      index: 0,
      onError,
      onLoaded,
      pictureElement: undefined as HTMLPictureElement | undefined,
      slide: { container: slideContainer },
      state: 'idle',
    };
    const contentLoadEvent = {
      content,
      isLazy: false,
      preventDefault: vi.fn(),
    };

    act(() => {
      instance.emit('contentLoad', contentLoadEvent);
    });

    expect(contentLoadEvent.preventDefault).toHaveBeenCalledOnce();

    const picture = content.pictureElement;

    if (!picture) {
      throw new Error('lightbox picture must exist');
    }

    const sources = picture.querySelectorAll('source');
    const image = picture.querySelector('img');

    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[0]).toHaveAttribute('srcset', '/assets/original.avif');
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
    expect(sources[1]).toHaveAttribute('srcset', '/assets/original.webp');
    expect(image).toHaveAttribute('src', '/assets/original.jpg');
    expect(image).toHaveAttribute('alt', '元画像の説明');
    expect(image).toHaveClass('pswp__img');
    expect(image?.decoding).toBe('async');
    expect(image?.draggable).toBe(false);
    expect(image?.loading).toBe('eager');

    const contentAppendEvent = { content, preventDefault: vi.fn() };

    act(() => {
      instance.emit('contentAppend', contentAppendEvent);
    });

    expect(contentAppendEvent.preventDefault).toHaveBeenCalledOnce();
    expect(slideContainer).toContainElement(picture);

    if (!image) {
      throw new Error('lightbox image must exist');
    }

    fireEvent.load(image);
    expect(onLoaded).toHaveBeenCalledOnce();

    act(() => {
      instance.emit('loadComplete', {
        content: { index: 0 },
        isError: false,
      });
    });

    expect(viewer).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(onImageLoadingChange).toHaveBeenLastCalledWith(false);

    const contentRemoveEvent = { content, preventDefault: vi.fn() };
    const removePicture = picture.remove.bind(picture);
    let fallbackSrcWhenPictureIsRemoved: string | null | undefined;

    vi.spyOn(picture, 'remove').mockImplementation(() => {
      fallbackSrcWhenPictureIsRemoved = image.getAttribute('src');
      removePicture();
    });

    act(() => {
      instance.emit('contentRemove', contentRemoveEvent);
    });

    expect(contentRemoveEvent.preventDefault).toHaveBeenCalledOnce();
    expect(fallbackSrcWhenPictureIsRemoved).toBe('data:,');
    expect(slideContainer).not.toContainElement(picture);
  });

  it('falls back to the logical original URL for images outside the manifest', () => {
    render(
      <ImageZoomViewer
        alt="未登録画像"
        height={600}
        onBackdropOpacityChange={vi.fn()}
        onClose={vi.fn()}
        onImageErrorChange={vi.fn()}
        onImageLoadingChange={vi.fn()}
        src="/media/unregistered.gif"
        width={800}
      />,
    );

    const instance = getInstance();
    const dataSource = instance.options.dataSource as Array<
      Record<string, unknown>
    >;
    const contentLoadEvent = {
      content: { data: dataSource[0] },
      isLazy: false,
      preventDefault: vi.fn(),
    };
    const image = document.createElement('img');

    expect(dataSource).toEqual([
      {
        alt: '未登録画像',
        avifSrc: undefined,
        height: 600,
        src: '/media/unregistered.gif',
        webpSrc: undefined,
        width: 800,
      },
    ]);

    act(() => {
      instance.emit('contentLoad', contentLoadEvent);
      instance.emit('contentLoadImage', { content: { element: image } });
    });

    expect(contentLoadEvent.preventDefault).not.toHaveBeenCalled();
    expect(image).toHaveClass('pswp__img');
    expect(image.decoding).toBe('async');
    expect(image.draggable).toBe(false);
    expect(image.loading).toBe('eager');
  });

  it('does not show the loading indicator when the image loads within one second', () => {
    vi.useFakeTimers();
    const onImageLoadingChange = vi.fn();

    renderViewer(vi.fn(), vi.fn(), onImageLoadingChange);

    act(() => {
      getInstance().emit('loadComplete', {
        content: { index: 0 },
        isError: false,
      });
      vi.advanceTimersByTime(1000);
    });

    expect(onImageLoadingChange).not.toHaveBeenCalledWith(true);
    expect(onImageLoadingChange).toHaveBeenCalledOnce();
    expect(onImageLoadingChange).toHaveBeenCalledWith(false);
  });

  it('shows an accessible error when the original image cannot load', () => {
    const onImageErrorChange = vi.fn();

    renderViewer(vi.fn(), vi.fn(), vi.fn(), onImageErrorChange);

    act(() => {
      getInstance().emit('loadComplete', {
        content: { index: 0 },
        isError: true,
      });
    });

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent('Error');
    expect(alert).toHaveTextContent('元画像を読み込めませんでした');
    expect(alert).toHaveClass('font-display', 'text-7xl');
    expect(onImageErrorChange).toHaveBeenLastCalledWith(true);
  });

  it('keeps one image bounded to the mobile and desktop viewing areas', () => {
    renderViewer();

    const options = getInstance().options;

    expect(options).toMatchObject({
      allowPanToNext: false,
      bgClickAction: expect.any(Function),
      bgOpacity: 0.8,
      closeOnVerticalDrag: true,
      doubleTapAction: 'zoom',
      hideAnimationDuration: 333,
      imageClickAction: false,
      pinchToClose: false,
      showHideAnimationType: 'fade',
      tapAction: false,
      wheelToZoom: true,
      zoomAnimationDuration: 200,
    });

    const getPadding = options.paddingFn as (viewport: {
      x: number;
      y: number;
    }) => { bottom: number; left: number; right: number; top: number };
    const getInitialZoom = options.initialZoomLevel as (zoom: {
      elementSize: { x: number; y: number };
      panAreaSize: { x: number; y: number };
    }) => number;
    const getMaxZoom = options.maxZoomLevel as (zoom: {
      initial: number;
    }) => number;

    expect(getPadding({ x: 390, y: 844 })).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    });
    expect(getPadding({ x: 1440, y: 900 })).toEqual({
      bottom: 90,
      left: 144,
      right: 144,
      top: 90,
    });
    expect(
      getInitialZoom({
        elementSize: { x: 1600, y: 900 },
        panAreaSize: { x: 390, y: 844 },
      }),
    ).toBeCloseTo(0.24375);
    expect(getMaxZoom({ initial: 0.25 })).toBe(1);

    const zoomLevels = { fit: 1, initial: 1.25 };

    act(() => {
      getInstance().emit('zoomLevelsUpdate', { zoomLevels });
    });

    expect(zoomLevels.fit).toBe(1.25);
  });

  it('requests an immediate close when the backdrop is clicked with a mouse', () => {
    const onClose = vi.fn();

    renderViewer(onClose);

    const instance = getInstance();
    const bgClickAction = instance.options.bgClickAction;
    const backdrop = document.createElement('div');
    const image = document.createElement('img');
    const backdropEvent = new PointerEvent('pointerup');
    const imageEvent = new PointerEvent('pointerup');

    backdrop.className = 'pswp__item';
    image.className = 'pswp__img';
    Object.defineProperty(backdropEvent, 'target', { value: backdrop });
    Object.defineProperty(imageEvent, 'target', { value: image });

    expect(bgClickAction).toBeTypeOf('function');

    if (typeof bgClickAction !== 'function') {
      throw new Error('backdrop click action must be a function');
    }

    bgClickAction.call(instance, { x: 10, y: 20 }, imageEvent);
    expect(onClose).not.toHaveBeenCalled();

    bgClickAction.call(instance, { x: 10, y: 20 }, backdropEvent);

    expect(onClose).toHaveBeenCalledOnce();
    expect(instance.close).not.toHaveBeenCalled();
  });

  it('closes immediately on a touch backdrop tap without treating a drag as a tap', async () => {
    const onClose = vi.fn();

    renderViewer(onClose);

    const instance = getInstance();
    const backdrop = document.createElement('div');
    const image = document.createElement('img');

    backdrop.className = 'pswp__item';
    image.className = 'pswp__img';

    const emitPointer = (
      eventName: 'pointerDown' | 'pointerUp',
      target: HTMLElement,
      pointerId: number,
    ) => {
      const originalEvent = new PointerEvent(eventName.toLowerCase(), {
        pointerId,
        pointerType: 'touch',
      });

      Object.defineProperty(originalEvent, 'target', { value: target });

      act(() => {
        instance.emit(eventName, { originalEvent });
      });
    };

    emitPointer('pointerDown', image, 1);
    emitPointer('pointerUp', image, 1);
    expect(onClose).not.toHaveBeenCalled();

    emitPointer('pointerDown', backdrop, 2);
    emitPointer('pointerUp', backdrop, 2);
    await act(async () => {});
    expect(onClose).toHaveBeenCalledOnce();

    instance.gestures.isDragging = true;
    emitPointer('pointerDown', backdrop, 3);
    emitPointer('pointerUp', backdrop, 3);
    await act(async () => {});
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('requests the outer close after PhotoSwipe finishes a vertical-drag close', async () => {
    const onClose = vi.fn();

    renderViewer(onClose);

    act(() => {
      getInstance().emit('closingAnimationEnd');
    });
    await act(async () => {});

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('reports the rendered backdrop opacity while dragging and closing', async () => {
    const onBackdropOpacityChange = vi.fn();

    const view = renderViewer(vi.fn(), onBackdropOpacityChange);

    const instance = getInstance();

    instance.bgOpacity = 0.4;
    act(() => {
      instance.emit('zoomPanUpdate');
    });

    expect(onBackdropOpacityChange).toHaveBeenLastCalledWith(0.4);

    if (instance.element) {
      instance.element.style.opacity = '0.5';
    }

    act(() => {
      instance.emit('closingAnimationStart');
    });
    await act(async () => {
      await nextAnimationFrame();
    });

    expect(onBackdropOpacityChange).toHaveBeenLastCalledWith(0.2);

    act(() => {
      instance.emit('closingAnimationEnd');
    });
    await act(async () => {});

    expect(onBackdropOpacityChange).toHaveBeenLastCalledWith(0);

    view.unmount();
  });

  it('does not request another close when cleanup destroys PhotoSwipe', async () => {
    const onClose = vi.fn();
    const view = renderViewer(onClose);
    const instance = getInstance();

    act(() => {
      instance.emit('closingAnimationEnd');
      view.unmount();
    });
    await act(async () => {});

    expect(onClose).not.toHaveBeenCalled();
  });

  it('lets PhotoSwipe own touch double-taps and handles mouse double-clicks once', () => {
    renderViewer();

    const instance = getInstance();

    act(() => {
      instance.emit('pointerDown', {
        originalEvent: { pointerType: 'touch' },
      });
    });
    fireEvent(instance.container as HTMLElement, createDoubleClick(110, 220));

    expect(instance.currSlide.toggleZoom).not.toHaveBeenCalled();

    act(() => {
      instance.emit('pointerDown', {
        originalEvent: { pointerType: 'mouse' },
      });
    });
    fireEvent(instance.container as HTMLElement, createDoubleClick(110, 220));

    expect(instance.currSlide.toggleZoom).toHaveBeenCalledOnce();
    expect(instance.currSlide.toggleZoom).toHaveBeenCalledWith({
      x: 100,
      y: 200,
    });
  });

  it('keeps pointer movement on the outer close control from cancelling its click', () => {
    renderViewer();

    const instance = getInstance();
    const filter = instance.filters.get('preventPointerEvent');
    const closeButton = document.createElement('button');
    const closeIcon = document.createElement('span');

    closeButton.dataset.imageLightboxClose = '';
    closeButton.append(closeIcon);

    expect(filter).toBeDefined();
    expect(
      filter?.(true, { target: closeIcon } as unknown as PointerEvent, 'move'),
    ).toBe(false);
    expect(
      filter?.(
        true,
        { target: instance.container } as unknown as PointerEvent,
        'move',
      ),
    ).toBe(true);
  });

  it('supports keyboard zoom while leaving Escape to the outer dialog', () => {
    renderViewer();

    const instance = getInstance();

    instance.currSlide.currZoomLevel = 1;
    emitKey(instance, '+');
    instance.currSlide.currZoomLevel = 0.6;
    emitKey(instance, '-');
    instance.currSlide.currZoomLevel = 1.5;
    emitKey(instance, '0');

    expect(instance.currSlide.zoomTo).toHaveBeenNthCalledWith(
      1,
      1.25,
      { x: 320, y: 240 },
      200,
    );
    expect(instance.currSlide.zoomTo).toHaveBeenNthCalledWith(
      2,
      0.5,
      { x: 320, y: 240 },
      200,
    );
    expect(instance.currSlide.zoomTo).toHaveBeenNthCalledWith(
      3,
      0.5,
      { x: 320, y: 240 },
      200,
    );
    expect(emitKey(instance, 'Tab').preventDefault).toHaveBeenCalledOnce();
    expect(emitKey(instance, 'Escape').preventDefault).not.toHaveBeenCalled();
  });

  it('destroys PhotoSwipe and its mouse listener on cleanup', () => {
    const view = renderViewer();
    const instance = getInstance();

    act(() => {
      instance.emit('pointerDown', {
        originalEvent: { pointerType: 'mouse' },
      });
    });

    view.unmount();

    expect(instance.destroy).toHaveBeenCalledOnce();
    expect(instance.element?.isConnected).toBe(false);

    fireEvent(instance.container as HTMLElement, createDoubleClick(110, 220));
    expect(instance.currSlide.toggleZoom).not.toHaveBeenCalled();
  });
});
