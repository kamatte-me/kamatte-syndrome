import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import closeFillIcon from '@/assets/icons/close_fill.svg';
import { cn } from '@/utils/classNames';
import { getRectOverlap, type RectOverlap } from '@/utils/cutoutGeometry';
import { addViewportListeners, createRafScheduler } from '@/utils/viewportRaf';
import { Icon } from './Icon';
import styles from './Modal.module.css';

type ModalRenderState = {
  isContentLayer: boolean;
};

type ModalCutoutConfig = {
  datasetKey: string;
  variablePrefix: string;
};

export type ModalProps = {
  bodyClassName?: string;
  children: ReactNode | ((state: ModalRenderState) => ReactNode);
  closeLabel?: string;
  dialogClassName?: string;
  onClose: () => void;
  titleId: string;
};

export const modalDialogSelector = '[data-ui-modal-dialog]';

const modalBodySelector = '[data-ui-modal-body]';
const modalStencilLayerSelector = '[data-cutout-layer="modal-stencil"]';
const contentHeaderSelector =
  '[data-cutout-layer="content"] [data-site-header]';
const modalCutoutRectProperties = ['height', 'left', 'top', 'width'] as const;
const siteHeaderModalCutoutConfig = {
  datasetKey: 'siteHeaderModalCutout',
  variablePrefix: '--site-header-modal-mask',
} as const satisfies ModalCutoutConfig;
const stencilLayerModalCutoutConfig = {
  datasetKey: 'cutoutModalCutout',
  variablePrefix: '--cutout-modal-mask',
} as const satisfies ModalCutoutConfig;

function clearModalCutout(element: HTMLElement, config: ModalCutoutConfig) {
  delete element.dataset[config.datasetKey];

  for (const property of modalCutoutRectProperties) {
    element.style.removeProperty(`${config.variablePrefix}-${property}`);
  }
}

function clearSiteHeaderModalState(header: HTMLElement) {
  delete header.dataset.siteHeaderModalOpen;
  clearModalCutout(header, siteHeaderModalCutoutConfig);
}

function applyModalCutout(
  element: HTMLElement,
  overlap: RectOverlap,
  config: ModalCutoutConfig,
) {
  element.dataset[config.datasetKey] = 'true';

  for (const property of modalCutoutRectProperties) {
    element.style.setProperty(
      `${config.variablePrefix}-${property}`,
      `${overlap[property]}px`,
    );
  }
}

export function Modal({
  bodyClassName: customBodyClassName,
  children,
  closeLabel = 'モーダルを閉じる',
  dialogClassName: customDialogClassName,
  onClose,
  titleId,
}: ModalProps) {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const stencilLayerRef = useRef<HTMLElement | null>(null);
  const [isContentLayer, setIsContentLayer] = useState(false);
  const [stencilPortalTarget, setStencilPortalTarget] =
    useState<HTMLElement | null>(null);
  const [stencilScrollY, setStencilScrollY] = useState<number | null>(null);

  // Identify whether this render is the interactive modal or its stencil copy.
  useLayoutEffect(() => {
    const stencilLayer =
      modalRootRef.current?.closest<HTMLElement>(
        '[data-cutout-layer="stencil"]',
      ) ?? null;

    if (!stencilLayer) {
      setIsContentLayer(true);
      stencilLayerRef.current = null;
      setStencilPortalTarget(null);
      setStencilScrollY(null);
      dialogRef.current?.focus({ preventScroll: true });

      return;
    }

    setIsContentLayer(false);
    stencilLayerRef.current = stencilLayer;
    setStencilPortalTarget(
      document.querySelector<HTMLElement>(modalStencilLayerSelector),
    );

    const updateStencilScrollY = () => {
      const scrollY = window.scrollY;

      setStencilScrollY(scrollY);
      stencilLayer?.style.setProperty(
        '--cutout-stencil-scroll-y',
        `${scrollY}px`,
      );
    };

    const stencilScrollYScheduler = createRafScheduler(updateStencilScrollY, {
      replacePending: true,
    });

    updateStencilScrollY();
    stencilLayer?.setAttribute('data-cutout-modal-open', '');

    const removeViewportListeners = addViewportListeners(
      stencilScrollYScheduler.schedule,
    );

    return () => {
      stencilScrollYScheduler.cancel();
      removeViewportListeners();
      stencilLayer?.removeAttribute('data-cutout-modal-open');
      stencilLayer?.style.removeProperty('--cutout-stencil-scroll-y');
      clearModalCutout(stencilLayer, stencilLayerModalCutoutConfig);
    };
  }, []);

  // Cut the base stencil only where the separately portaled modal stencil sits.
  useLayoutEffect(() => {
    if (isContentLayer || !stencilPortalTarget) {
      return;
    }

    const stencilLayer = stencilLayerRef.current;
    const dialog = dialogRef.current;

    if (!stencilLayer || !dialog) {
      return;
    }

    const updateStencilLayerCutout = () => {
      const dialogRect = dialog.getBoundingClientRect();
      const stencilRect = stencilLayer.getBoundingClientRect();
      const overlap = getRectOverlap(dialogRect, stencilRect);

      clearModalCutout(stencilLayer, stencilLayerModalCutoutConfig);

      if (!overlap) {
        return;
      }

      applyModalCutout(stencilLayer, overlap, stencilLayerModalCutoutConfig);
    };

    const stencilLayerCutoutScheduler = createRafScheduler(
      updateStencilLayerCutout,
      {
        replacePending: true,
      },
    );

    const resizeObserver = new ResizeObserver(
      stencilLayerCutoutScheduler.schedule,
    );

    resizeObserver.observe(dialog);
    resizeObserver.observe(stencilLayer);
    updateStencilLayerCutout();

    const removeViewportListeners = addViewportListeners(
      stencilLayerCutoutScheduler.schedule,
    );

    return () => {
      stencilLayerCutoutScheduler.cancel();
      resizeObserver.disconnect();
      removeViewportListeners();
      clearModalCutout(stencilLayer, stencilLayerModalCutoutConfig);
    };
  }, [isContentLayer, stencilPortalTarget]);

  // The content layer owns real interaction, focus, and body scroll locking.
  useEffect(() => {
    if (!isContentLayer) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isContentLayer, onClose]);

  // Mirror modal-body scrolling so the stencil copy stays visually aligned.
  useEffect(() => {
    if (!isContentLayer) {
      return;
    }

    const modalRoot = modalRootRef.current;
    const sourceBody = modalRoot?.querySelector<HTMLElement>(modalBodySelector);

    if (!modalRoot || !sourceBody) {
      return;
    }

    let stencilBody: HTMLElement | null = null;
    const getStencilBody = () => {
      stencilBody ??= document.querySelector<HTMLElement>(
        `${modalStencilLayerSelector} ${modalBodySelector}, [data-cutout-layer="stencil"] ${modalBodySelector}`,
      );

      return stencilBody;
    };

    const syncStencilScroll = () => {
      const targetBody = getStencilBody();

      if (!targetBody) {
        return;
      }

      targetBody.scrollTop = sourceBody.scrollTop;
      targetBody.scrollLeft = sourceBody.scrollLeft;
    };

    const animationFrame = window.requestAnimationFrame(syncStencilScroll);

    sourceBody.addEventListener('scroll', syncStencilScroll, {
      passive: true,
    });
    window.addEventListener('resize', syncStencilScroll);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      sourceBody.removeEventListener('scroll', syncStencilScroll);
      window.removeEventListener('resize', syncStencilScroll);
    };
  }, [isContentLayer]);

  const modalStyle =
    stencilScrollY === null
      ? undefined
      : ({
          '--modal-scroll-y': `${stencilScrollY}px`,
        } as CSSProperties);
  const renderedChildren =
    typeof children === 'function' ? children({ isContentLayer }) : children;

  // Hide the content-layer header only where it visually overlaps the modal.
  useEffect(() => {
    if (!isContentLayer) {
      return;
    }

    const dialog = dialogRef.current;
    const header = document.querySelector<HTMLElement>(contentHeaderSelector);

    if (!dialog || !header) {
      return;
    }

    header.dataset.siteHeaderModalOpen = 'true';

    const updateHeaderCutout = () => {
      const dialogRect = dialog.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();
      const overlap = getRectOverlap(dialogRect, headerRect);

      clearModalCutout(header, siteHeaderModalCutoutConfig);

      if (!overlap) {
        return;
      }

      applyModalCutout(header, overlap, siteHeaderModalCutoutConfig);
    };

    const headerCutoutScheduler = createRafScheduler(updateHeaderCutout, {
      replacePending: true,
    });

    const resizeObserver = new ResizeObserver(headerCutoutScheduler.schedule);

    resizeObserver.observe(dialog);
    resizeObserver.observe(header);
    updateHeaderCutout();

    const removeViewportListeners = addViewportListeners(
      headerCutoutScheduler.schedule,
    );

    return () => {
      headerCutoutScheduler.cancel();
      resizeObserver.disconnect();
      removeViewportListeners();
      clearSiteHeaderModalState(header);
    };
  }, [isContentLayer]);

  const modal = (
    <div
      ref={modalRootRef}
      className={cn(
        styles.root,
        'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 md:p-0 [@media_(orientation:landscape)_and_(max-height:500px)]:p-4',
      )}
      data-ui-modal-root=""
      style={modalStyle}
    >
      <button
        type="button"
        aria-label={closeLabel}
        className="fixed inset-0 size-full cursor-default"
        onClick={onClose}
      />
      <section
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          styles.panel,
          'relative flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-6xl flex-col overflow-hidden border-8 border-cutout-hole outline-none sm:h-[calc(100dvh-4rem)] sm:w-[calc(100vw-4rem)] md:h-[80dvh] md:max-h-[48rem] md:w-[80vw] [@media_(orientation:landscape)_and_(max-height:500px)]:h-[calc(100dvh-2rem)] [@media_(orientation:landscape)_and_(max-height:500px)]:w-[calc(100vw-4rem)]',
          customDialogClassName,
        )}
        data-ui-modal-dialog=""
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex shrink-0 justify-end p-1.5 sm:p-2">
          <button
            type="button"
            aria-label={closeLabel}
            className="flex size-13 cursor-pointer items-center justify-center text-cutout-hole hover:text-cutout-hole focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole sm:size-14 [@media_(orientation:landscape)_and_(max-height:500px)]:size-13"
            onClick={onClose}
          >
            <Icon
              className="size-12 sm:size-14 [@media_(orientation:landscape)_and_(max-height:500px)]:size-10"
              src={closeFillIcon}
            />
          </button>
        </div>

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row [@media_(orientation:landscape)_and_(max-height:500px)]:flex-row',
            customBodyClassName,
          )}
          data-ui-modal-body=""
        >
          {renderedChildren}
        </div>
      </section>
    </div>
  );

  if (!isContentLayer && stencilPortalTarget) {
    return createPortal(modal, stencilPortalTarget);
  }

  return modal;
}
