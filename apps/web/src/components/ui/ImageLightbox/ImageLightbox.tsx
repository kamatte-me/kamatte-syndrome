import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import closeFillIcon from '@/assets/icons/close_fill.svg';
import unhappyDizzyFillIcon from '@/assets/icons/unhappy_dizzy_fill.svg?inline';
import { Icon } from '@/components/ui/Icon';
import { addViewportListeners, createRafScheduler } from '@/utils/viewportRaf';
import styles from './ImageLightbox.module.css';
import { ImageZoomViewer } from './ImageZoomViewer';

export type ImageLightboxProps = {
  alt: string;
  height: number;
  onClose: () => void;
  returnFocusElement: HTMLElement | null;
  src: string;
  width: number;
};

const contentLayerSelector = '[data-cutout-layer="content"]';
const pageCutoutLayerSelector =
  '[data-cutout-layer="stencil"], [data-cutout-layer="content"]';
const closeIconSelector = '[data-image-lightbox-close-icon]';
const errorIconSelector = '[data-image-lightbox-error-icon]';
const loadingIconSelector = '[data-image-lightbox-loading-icon]';
const closeCutoutProperties = ['height', 'left', 'top', 'width'] as const;
const closeCutoutOpacityProperty = '--image-lightbox-close-opacity';
const focusableSelector =
  'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
const overlayClassName =
  'fixed inset-0 z-[1000] h-dvh w-screen overflow-hidden outline-none';
const closeControlClassName =
  'fixed z-10 flex shrink-0 items-center justify-center text-cutout-hole';

function isPointerInside(
  event: ReactPointerEvent<HTMLButtonElement>,
  element: HTMLButtonElement,
) {
  const rect = element.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function clearCloseCutout(layer: HTMLElement) {
  delete layer.dataset.imageLightboxCloseCutout;

  for (const property of closeCutoutProperties) {
    layer.style.removeProperty(`--image-lightbox-close-mask-${property}`);
    layer.style.removeProperty(`--image-lightbox-loading-mask-${property}`);
    layer.style.removeProperty(`--image-lightbox-error-icon-mask-${property}`);
  }

  layer.style.removeProperty(closeCutoutOpacityProperty);
}

function setCutoutRect(
  layer: HTMLElement,
  name: 'close' | 'error-icon' | 'loading',
  cutoutRect: DOMRect,
  layerRect: DOMRect,
) {
  layer.style.setProperty(
    `--image-lightbox-${name}-mask-height`,
    `${cutoutRect.height}px`,
  );
  layer.style.setProperty(
    `--image-lightbox-${name}-mask-left`,
    `${cutoutRect.left - layerRect.left}px`,
  );
  layer.style.setProperty(
    `--image-lightbox-${name}-mask-top`,
    `${cutoutRect.top - layerRect.top}px`,
  );
  layer.style.setProperty(
    `--image-lightbox-${name}-mask-width`,
    `${cutoutRect.width}px`,
  );
}

export function ImageLightbox({
  alt,
  height,
  onClose,
  returnFocusElement,
  src,
  width,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closePointerIdRef = useRef<number | null>(null);
  const closePointerTimerRef = useRef<number | null>(null);
  const closeCutoutLayersRef = useRef<HTMLElement[]>([]);
  const errorPageMaskRef = useRef<SVGMaskElement>(null);
  const errorPageMaskTextRef = useRef<SVGTextElement>(null);
  const errorViewerMaskTextRef = useRef<SVGTextElement>(null);
  const ignoreNextCloseClickRef = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusFrameRef = useRef<number | null>(null);

  const handleBackdropOpacityChange = useCallback((opacity: number) => {
    const value = String(Math.min(Math.max(opacity, 0), 1));

    dialogRef.current?.style.setProperty(closeCutoutOpacityProperty, value);

    for (const layer of closeCutoutLayersRef.current) {
      layer.style.setProperty(closeCutoutOpacityProperty, value);
    }
  }, []);

  const handleImageLoadingChange = useCallback((isLoading: boolean) => {
    document.body.classList.toggle(styles.loadingActive, isLoading);
  }, []);
  const handleImageErrorChange = useCallback((hasError: boolean) => {
    document.body.classList.toggle(styles.errorActive, hasError);
  }, []);

  useLayoutEffect(() => {
    if (restoreFocusFrameRef.current !== null) {
      window.cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = null;
    }

    const activeElement = document.activeElement;
    const focusReturnTarget =
      returnFocusElement ??
      (activeElement instanceof HTMLElement ? activeElement : null);
    const contentLayer =
      document.querySelector<HTMLElement>(contentLayerSelector);
    const previousAriaHidden =
      contentLayer?.getAttribute('aria-hidden') ?? null;
    const wasInert = contentLayer?.inert ?? false;
    const previousOverflow = document.body.style.overflow;

    const keepFocusInside = (event: FocusEvent) => {
      if (
        event.target instanceof Node &&
        !dialogRef.current?.contains(event.target)
      ) {
        closeButtonRef.current?.focus({ preventScroll: true });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
          )
        : [];
      const firstElement = focusableElements.at(0);
      const lastElement = focusableElements.at(-1);

      if (
        !firstElement ||
        !lastElement ||
        !dialogRef.current?.contains(document.activeElement)
      ) {
        event.preventDefault();
        firstElement?.focus();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    closeButtonRef.current?.focus({ preventScroll: true });

    document.body.setAttribute('data-image-lightbox-open', '');
    document.body.style.overflow = 'hidden';
    contentLayer?.setAttribute('aria-hidden', 'true');
    if (contentLayer) {
      contentLayer.inert = true;
    }

    document.addEventListener('focusin', keepFocusInside, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (closePointerTimerRef.current !== null) {
        window.clearTimeout(closePointerTimerRef.current);
        closePointerTimerRef.current = null;
      }

      document.removeEventListener('focusin', keepFocusInside, true);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.removeAttribute('data-image-lightbox-open');
      document.body.classList.remove(styles.errorActive);
      document.body.classList.remove(styles.loadingActive);
      document.body.style.overflow = previousOverflow;

      if (contentLayer) {
        contentLayer.inert = wasInert;

        if (previousAriaHidden === null) {
          contentLayer.removeAttribute('aria-hidden');
        } else {
          contentLayer.setAttribute('aria-hidden', previousAriaHidden);
        }
      }

      restoreFocusFrameRef.current = window.requestAnimationFrame(() => {
        restoreFocusFrameRef.current = null;

        if (focusReturnTarget?.isConnected) {
          focusReturnTarget.focus();
        }
      });
    };
  }, [onClose, returnFocusElement]);

  useLayoutEffect(() => {
    const closeIcon =
      closeButtonRef.current?.querySelector<HTMLElement>(closeIconSelector);
    const errorIcon =
      dialogRef.current?.querySelector<HTMLElement>(errorIconSelector);
    const loadingIcon =
      dialogRef.current?.querySelector<HTMLElement>(loadingIconSelector);
    const pageCutoutLayers = Array.from(
      document.querySelectorAll<HTMLElement>(pageCutoutLayerSelector),
    );

    if (
      !closeIcon ||
      !errorIcon ||
      !loadingIcon ||
      pageCutoutLayers.length === 0
    ) {
      return;
    }

    closeCutoutLayersRef.current = pageCutoutLayers;

    const updateCloseCutouts = () => {
      const closeIconRect = closeIcon.getBoundingClientRect();
      const dialog = dialogRef.current;
      const dialogRect = dialog?.getBoundingClientRect();
      const errorIconRect = errorIcon.getBoundingClientRect();
      const loadingIconRect = loadingIcon.getBoundingClientRect();
      const pageLayerRect = pageCutoutLayers[0]?.getBoundingClientRect();

      if (
        dialog &&
        dialogRect &&
        pageLayerRect &&
        errorPageMaskRef.current &&
        errorPageMaskTextRef.current &&
        errorViewerMaskTextRef.current
      ) {
        const centerX = dialogRect.left + dialogRect.width / 2;
        const centerY = dialogRect.top + dialogRect.height / 2;

        errorPageMaskRef.current.setAttribute(
          'height',
          String(pageLayerRect.height),
        );
        errorPageMaskRef.current.setAttribute(
          'width',
          String(pageLayerRect.width),
        );
        errorPageMaskTextRef.current.setAttribute(
          'x',
          String(centerX - pageLayerRect.left),
        );
        errorPageMaskTextRef.current.setAttribute(
          'y',
          String(centerY - pageLayerRect.top),
        );
        errorViewerMaskTextRef.current.setAttribute(
          'x',
          String(centerX - dialogRect.left),
        );
        errorViewerMaskTextRef.current.setAttribute(
          'y',
          String(centerY - dialogRect.top),
        );
        setCutoutRect(dialog, 'error-icon', errorIconRect, dialogRect);
      }

      for (const layer of pageCutoutLayers) {
        const layerRect = layer.getBoundingClientRect();

        layer.dataset.imageLightboxCloseCutout = '';
        setCutoutRect(layer, 'close', closeIconRect, layerRect);
        setCutoutRect(layer, 'error-icon', errorIconRect, layerRect);
        setCutoutRect(layer, 'loading', loadingIconRect, layerRect);
      }
    };

    const closeCutoutScheduler = createRafScheduler(updateCloseCutouts, {
      replacePending: true,
    });
    const resizeObserver = new ResizeObserver(closeCutoutScheduler.schedule);

    resizeObserver.observe(closeIcon);
    resizeObserver.observe(errorIcon);
    resizeObserver.observe(loadingIcon);

    for (const layer of pageCutoutLayers) {
      resizeObserver.observe(layer);
    }

    updateCloseCutouts();

    const removeViewportListeners = addViewportListeners(
      closeCutoutScheduler.schedule,
    );

    return () => {
      closeCutoutLayersRef.current = [];
      closeCutoutScheduler.cancel();
      resizeObserver.disconnect();
      removeViewportListeners();

      for (const layer of pageCutoutLayers) {
        clearCloseCutout(layer);
      }
    };
  }, []);

  const handleClosePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (event.pointerType !== 'mouse' && closePointerIdRef.current === null) {
      closePointerIdRef.current = event.pointerId;
    }
  };

  const handleClosePointerCancel = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (closePointerIdRef.current === event.pointerId) {
      closePointerIdRef.current = null;
    }
  };

  const handleClosePointerUp = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (closePointerIdRef.current !== event.pointerId) {
      return;
    }

    closePointerIdRef.current = null;

    if (!isPointerInside(event, event.currentTarget)) {
      return;
    }

    // Android may omit the compatibility click immediately after a PhotoSwipe
    // gesture. Keep the button mounted through that click, then close anyway.
    ignoreNextCloseClickRef.current = true;
    closePointerTimerRef.current = window.setTimeout(() => {
      closePointerTimerRef.current = null;
      onClose();
    }, 0);
  };

  const handleCloseClick = () => {
    if (ignoreNextCloseClickRef.current) {
      ignoreNextCloseClickRef.current = false;
      return;
    }

    onClose();
  };

  return createPortal(
    <section
      ref={dialogRef}
      aria-label="画像の拡大表示"
      aria-modal="true"
      className={`${styles.overlay} ${overlayClassName}`}
      role="dialog"
      tabIndex={-1}
    >
      <svg
        aria-hidden="true"
        className="absolute size-0 overflow-hidden"
        focusable="false"
      >
        <defs>
          <mask
            height="100vh"
            id="image-lightbox-error-viewer-mask"
            maskContentUnits="userSpaceOnUse"
            maskUnits="userSpaceOnUse"
            width="100vw"
            x="0"
            y="0"
          >
            <text
              ref={errorViewerMaskTextRef}
              className={styles.errorMaskText}
              dominantBaseline="central"
              textAnchor="middle"
              x="50vw"
              y="50vh"
            >
              Error
            </text>
          </mask>
          <mask
            ref={errorPageMaskRef}
            height="1"
            id="image-lightbox-error-page-mask"
            maskContentUnits="userSpaceOnUse"
            maskUnits="userSpaceOnUse"
            width="1"
            x="0"
            y="0"
          >
            <text
              ref={errorPageMaskTextRef}
              className={styles.errorMaskText}
              dominantBaseline="central"
              textAnchor="middle"
            >
              Error
            </text>
          </mask>
        </defs>
      </svg>

      <Icon
        className={styles.errorIcon}
        data-image-lightbox-error-icon=""
        src={unhappyDizzyFillIcon}
      />

      <button
        ref={closeButtonRef}
        type="button"
        aria-label="画像の拡大表示を閉じる"
        className={`${styles.closeControl} ${closeControlClassName} cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-readable focus-visible:outline-offset-[-2px]`}
        data-image-lightbox-close=""
        onClick={handleCloseClick}
        onPointerCancel={handleClosePointerCancel}
        onPointerDown={handleClosePointerDown}
        onPointerUp={handleClosePointerUp}
      >
        <Icon
          className="size-12"
          data-image-lightbox-close-icon=""
          src={closeFillIcon}
        />
      </button>

      <div
        className={`${styles.viewerLayer} absolute inset-0 flex min-h-0 overflow-hidden`}
      >
        <ImageZoomViewer
          key={src}
          alt={alt}
          height={height}
          onBackdropOpacityChange={handleBackdropOpacityChange}
          onClose={onClose}
          onImageErrorChange={handleImageErrorChange}
          onImageLoadingChange={handleImageLoadingChange}
          src={src}
          width={width}
        />
      </div>
    </section>,
    document.body,
  );
}
