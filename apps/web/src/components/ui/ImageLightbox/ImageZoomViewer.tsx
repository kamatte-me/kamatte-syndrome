/* biome-ignore-all lint/a11y/noNoninteractiveTabindex: The zoom viewport is directly operable with the documented keyboard shortcuts. */

'use client';

import PhotoSwipe, {
  type EventCallback,
  type PhotoSwipeOptions,
  type Point,
  type ZoomLevelOption,
} from 'photoswipe';
import 'photoswipe/style.css';
import { manifest as lightboxImageManifest } from 'virtual:react-optimized-responsive-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=original';
import { useEffect, useId, useRef, useState } from 'react';
import circleDashFillAnimatedIcon from '@/assets/icons/circle_dash_fill_animated.svg?inline';
import { Icon } from '@/components/ui/Icon';
import styles from './ImageLightbox.module.css';

const desktopBreakpoint = 768;
const desktopMaxHeight = 768;
const desktopMaxWidth = 1152;
const keyboardZoomStep = 0.5;
const loadingIndicatorDelay = 1000;
const zoomAnimationDuration = 200;
const closeControlSelector = '[data-image-lightbox-close]';
const emptyImageSrc = 'data:,';

type ImageZoomViewerProps = {
  alt: string;
  height: number;
  onBackdropOpacityChange: (opacity: number) => void;
  onClose: () => void;
  onImageErrorChange: (hasError: boolean) => void;
  onImageLoadingChange: (isLoading: boolean) => void;
  src: string;
  width: number;
};

type ImageLoadState = {
  src: string;
  status: 'error' | 'loaded';
};

function getOriginalVariantSrc(
  variants: readonly { src: string; width: number }[],
  naturalWidth: number,
) {
  return variants.find(({ width }) => width === naturalWidth)?.src;
}

function prepareImageElement(image: HTMLImageElement) {
  image.className = 'pswp__img';
  image.decoding = 'async';
  image.draggable = false;
  image.loading = 'eager';
}

function appendPictureSource(
  picture: HTMLPictureElement,
  src: string | undefined,
  type: 'image/avif' | 'image/webp',
) {
  if (!src) {
    return;
  }

  const source = document.createElement('source');

  source.srcset = src;
  source.type = type;
  picture.append(source);
}

function getInitialZoomLevel(
  zoomLevel: Parameters<Exclude<ZoomLevelOption, number | string>>[0],
) {
  if (!zoomLevel.elementSize || !zoomLevel.panAreaSize) {
    return 1;
  }

  return Math.min(
    zoomLevel.panAreaSize.x / zoomLevel.elementSize.x,
    zoomLevel.panAreaSize.y / zoomLevel.elementSize.y,
  );
}

function getViewportPadding(viewportSize: Point) {
  if (viewportSize.x < desktopBreakpoint) {
    return { bottom: 0, left: 0, right: 0, top: 0 };
  }

  const imageAreaWidth = Math.min(viewportSize.x * 0.8, desktopMaxWidth);
  const imageAreaHeight = Math.min(viewportSize.y * 0.8, desktopMaxHeight);
  const horizontalPadding = Math.max((viewportSize.x - imageAreaWidth) / 2, 0);
  const verticalPadding = Math.max((viewportSize.y - imageAreaHeight) / 2, 0);

  return {
    bottom: verticalPadding,
    left: horizontalPadding,
    right: horizontalPadding,
    top: verticalPadding,
  };
}

function isBackdropTarget(originalEvent: PointerEvent) {
  return (
    originalEvent.target instanceof Element &&
    originalEvent.target.matches('.pswp__item, .pswp__zoom-wrap')
  );
}

function handleKeyDown(
  event: Parameters<EventCallback<'keydown'>>[0],
  photoSwipe: PhotoSwipe,
) {
  const { originalEvent } = event;

  // The outer dialog owns its focus loop.
  if (originalEvent.key === 'Tab') {
    event.preventDefault();
    return;
  }

  if (
    originalEvent.altKey ||
    originalEvent.ctrlKey ||
    originalEvent.metaKey ||
    (originalEvent.target instanceof HTMLElement &&
      (originalEvent.target.isContentEditable ||
        originalEvent.target.matches('input, select, textarea')))
  ) {
    return;
  }

  const slide = photoSwipe.currSlide;

  if (!slide) {
    return;
  }

  const { initial, max } = slide.zoomLevels;
  let zoomLevel: number;

  switch (originalEvent.key) {
    case '+':
    case '=':
      zoomLevel = Math.min(
        slide.currZoomLevel + initial * keyboardZoomStep,
        max,
      );
      break;
    case '-':
    case '_':
      zoomLevel = Math.max(
        slide.currZoomLevel - initial * keyboardZoomStep,
        initial,
      );
      break;
    case '0':
      zoomLevel = initial;
      break;
    default:
      return;
  }

  event.preventDefault();
  originalEvent.preventDefault();
  slide.zoomTo(
    zoomLevel,
    photoSwipe.getViewportCenterPoint(),
    zoomAnimationDuration,
  );
}

export function ImageZoomViewer({
  alt,
  height,
  onBackdropOpacityChange,
  onClose,
  onImageErrorChange,
  onImageLoadingChange,
  src,
  width,
}: ImageZoomViewerProps) {
  const instructionsId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<ImageLoadState | null>(null);
  const imageStatus = loadState?.src === src ? loadState.status : 'loading';

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    let isActive = true;
    let backdropPointerId: number | null = null;
    let lastPointerType: string | null = null;
    let closeFadeFrame: number | null = null;
    let photoSwipeElement: HTMLElement | null = null;
    let loadingIndicatorTimer: number | null = window.setTimeout(() => {
      loadingIndicatorTimer = null;

      if (isActive) {
        onImageLoadingChange(true);
      }
    }, loadingIndicatorDelay);

    onBackdropOpacityChange(1);
    onImageErrorChange(false);

    const imageEntry = lightboxImageManifest[src];
    const resolvedHeight = imageEntry?.height ?? height;
    const resolvedWidth = imageEntry?.width ?? width;
    const avifSrc = imageEntry
      ? getOriginalVariantSrc(imageEntry.avif, imageEntry.width)
      : undefined;
    const webpSrc = imageEntry
      ? getOriginalVariantSrc(imageEntry.webp, imageEntry.width)
      : undefined;

    const closeOnBackdropTap = (_point: Point, originalEvent: PointerEvent) => {
      if (isBackdropTarget(originalEvent)) {
        onClose();
      }
    };
    const photoSwipe = new PhotoSwipe({
      allowPanToNext: false,
      appendToEl: viewport,
      arrowKeys: false,
      arrowNext: false,
      arrowPrev: false,
      bgClickAction: closeOnBackdropTap,
      bgOpacity: 0.8,
      clickToCloseNonZoomable: false,
      close: false,
      closeOnVerticalDrag: true,
      counter: false,
      dataSource: [
        {
          alt,
          avifSrc,
          height: resolvedHeight,
          src: imageEntry?.src ?? src,
          webpSrc,
          width: resolvedWidth,
        },
      ],
      doubleTapAction: 'zoom',
      errorMsg: '',
      escKey: false,
      hideAnimationDuration: 333,
      imageClickAction: false,
      initialZoomLevel: getInitialZoomLevel,
      loop: false,
      mainClass: styles.photoSwipe,
      maxZoomLevel: (zoomLevel) => zoomLevel.initial * 4,
      paddingFn: getViewportPadding,
      pinchToClose: false,
      preload: [0, 0],
      returnFocus: false,
      secondaryZoomLevel: (zoomLevel) => zoomLevel.initial * 2,
      showAnimationDuration: 0,
      showHideAnimationType: 'fade',
      spacing: 0,
      tapAction: false,
      trapFocus: false,
      wheelToZoom: true,
      zoom: false,
      zoomAnimationDuration,
    } satisfies PhotoSwipeOptions);

    const stopCloseFade = () => {
      if (closeFadeFrame !== null) {
        window.cancelAnimationFrame(closeFadeFrame);
        closeFadeFrame = null;
      }
    };
    const stopLoadingIndicator = () => {
      if (loadingIndicatorTimer !== null) {
        window.clearTimeout(loadingIndicatorTimer);
        loadingIndicatorTimer = null;
      }
    };
    const syncCloseFade = () => {
      closeFadeFrame = null;

      if (!isActive || !photoSwipe.element) {
        return;
      }

      const rootOpacity = Number.parseFloat(
        window.getComputedStyle(photoSwipe.element).opacity,
      );

      onBackdropOpacityChange(
        photoSwipe.bgOpacity * (Number.isFinite(rootOpacity) ? rootOpacity : 1),
      );
      closeFadeFrame = window.requestAnimationFrame(syncCloseFade);
    };

    photoSwipe.addFilter(
      'preventPointerEvent',
      (preventPointerEvent, originalEvent) =>
        originalEvent.target instanceof Element &&
        originalEvent.target.closest(closeControlSelector)
          ? false
          : preventPointerEvent,
    );

    photoSwipe.on('uiRegister', () => {
      photoSwipe.element?.removeAttribute('role');
      photoSwipe.element?.removeAttribute('tabindex');
      photoSwipe.scrollWrap?.removeAttribute('aria-roledescription');
      photoSwipe.container?.removeAttribute('aria-live');
    });

    photoSwipe.on('pointerDown', ({ originalEvent }) => {
      lastPointerType = originalEvent.pointerType;
      backdropPointerId =
        originalEvent.pointerType !== 'mouse' && isBackdropTarget(originalEvent)
          ? originalEvent.pointerId
          : null;
    });

    photoSwipe.on('pointerUp', ({ originalEvent }) => {
      if (backdropPointerId !== originalEvent.pointerId) {
        return;
      }

      backdropPointerId = null;

      if (
        !originalEvent.type.includes('cancel') &&
        !photoSwipe.gestures.isDragging &&
        !photoSwipe.gestures.isZooming &&
        !photoSwipe.gestures.isMultitouch
      ) {
        queueMicrotask(() => {
          if (isActive) {
            onClose();
          }
        });
      }
    });

    photoSwipe.on('contentLoad', (event) => {
      const { content } = event;
      const { avifSrc: contentAvifSrc, webpSrc: contentWebpSrc } = content.data;

      if (!contentAvifSrc && !contentWebpSrc) {
        return;
      }

      event.preventDefault();

      const picture = document.createElement('picture');
      const image = document.createElement('img');

      appendPictureSource(picture, contentAvifSrc, 'image/avif');
      appendPictureSource(picture, contentWebpSrc, 'image/webp');

      image.alt = content.data.alt ?? '';
      image.src = content.data.src ?? '';
      prepareImageElement(image);
      picture.append(image);

      content.element = image;
      content.pictureElement = picture;
      content.state = 'loading';

      if (image.complete) {
        content.onLoaded();
      } else {
        image.onload = () => content.onLoaded();
        image.onerror = () => content.onError();
      }
    });

    photoSwipe.on('contentAppend', (event) => {
      const { content } = event;

      if (content.pictureElement && !content.pictureElement.parentNode) {
        event.preventDefault();
        content.slide?.container.append(content.pictureElement);
      }
    });

    photoSwipe.on('contentRemove', (event) => {
      const { content } = event;

      if (content.pictureElement?.parentNode) {
        event.preventDefault();
        // Chromium selects the img fallback src while this picture is being
        // detached, including while its preferred source is still loading.
        // Replace the fallback with an empty data URI first so the original
        // JPEG is not requested after the viewer closes.
        content.element?.setAttribute('src', emptyImageSrc);
        content.pictureElement.remove();
      }
    });

    photoSwipe.on('contentLoadImage', ({ content }) => {
      if (content.element instanceof HTMLImageElement) {
        prepareImageElement(content.element);
      }
    });

    photoSwipe.on('loadComplete', ({ content, isError }) => {
      if (isActive && content.index === 0) {
        stopLoadingIndicator();
        setLoadState({
          src,
          status: isError ? 'error' : 'loaded',
        });
        onImageErrorChange(Boolean(isError));
        onImageLoadingChange(false);
      }
    });

    photoSwipe.on('zoomLevelsUpdate', ({ zoomLevels }) => {
      if (zoomLevels.initial > zoomLevels.fit) {
        zoomLevels.fit = zoomLevels.initial;
      }
    });

    photoSwipe.on('zoomPanUpdate', () => {
      if (isActive) {
        onBackdropOpacityChange(photoSwipe.bgOpacity);
      }
    });

    photoSwipe.on('closingAnimationStart', () => {
      if (!isActive) {
        return;
      }

      stopCloseFade();
      closeFadeFrame = window.requestAnimationFrame(syncCloseFade);
    });

    photoSwipe.on('closingAnimationEnd', () => {
      stopCloseFade();

      if (!isActive) {
        return;
      }

      onBackdropOpacityChange(0);

      queueMicrotask(() => {
        if (isActive) {
          onClose();
        }
      });
    });

    photoSwipe.on('keydown', (event) => handleKeyDown(event, photoSwipe));
    photoSwipe.init();
    photoSwipeElement = photoSwipe.element ?? null;

    const handleDoubleClick = (event: MouseEvent) => {
      if (
        lastPointerType !== 'mouse' ||
        !(event.target instanceof Element) ||
        !event.target.closest('.pswp__container')
      ) {
        return;
      }

      event.preventDefault();
      photoSwipe.currSlide?.toggleZoom({
        x: event.pageX - photoSwipe.offset.x,
        y: event.pageY - photoSwipe.offset.y,
      });
    };

    photoSwipeElement?.addEventListener('dblclick', handleDoubleClick);

    return () => {
      isActive = false;
      stopCloseFade();
      stopLoadingIndicator();
      onImageErrorChange(false);
      onImageLoadingChange(false);

      photoSwipeElement?.removeEventListener('dblclick', handleDoubleClick);
      photoSwipe.destroy();
    };
  }, [
    alt,
    height,
    onBackdropOpacityChange,
    onClose,
    onImageErrorChange,
    onImageLoadingChange,
    src,
    width,
  ]);

  return (
    <section
      aria-busy={imageStatus === 'loading'}
      aria-describedby={instructionsId}
      aria-label="画像ズームビューアー"
      className={`${styles.viewerRoot} flex min-h-0 flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-readable focus-visible:outline-offset-[-2px]`}
      tabIndex={0}
    >
      <p className="sr-only" id={instructionsId}>
        ピンチ、ダブルタップ、ダブルクリック、ホイールで拡大縮小できます。画像の外側をタップするか、初期表示で上下スワイプすると閉じられます。プラスキーとマイナスキーで拡大縮小、0キーでリセットできます。
      </p>

      <div ref={viewportRef} className={styles.viewerViewport} />

      {imageStatus === 'loading' ? (
        <p
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
          role="status"
        >
          <Icon
            className={styles.loadingIcon}
            data-image-lightbox-loading-icon=""
            src={circleDashFillAnimatedIcon}
          />
          <span className="sr-only">元画像を読み込んでいます</span>
        </p>
      ) : null}

      {imageStatus === 'error' ? (
        <p
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center p-4 text-center font-display font-normal text-7xl text-cutout-hole leading-none sm:text-8xl md:text-9xl"
          role="alert"
        >
          <span aria-hidden="true">Error</span>
          <span className="sr-only">元画像を読み込めませんでした</span>
        </p>
      ) : null}
    </section>
  );
}
