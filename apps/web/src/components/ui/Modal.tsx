import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';
import styles from './Modal.module.css';

type ModalRenderState = {
  isContentLayer: boolean;
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
  const [isContentLayer, setIsContentLayer] = useState(false);
  const [stencilScrollY, setStencilScrollY] = useState<number | null>(null);

  useLayoutEffect(() => {
    const isStencilModal = Boolean(
      modalRootRef.current?.closest('[data-cutout-layer="stencil"]'),
    );

    setIsContentLayer(!isStencilModal);

    if (!isStencilModal) {
      setStencilScrollY(null);
      dialogRef.current?.focus();

      return;
    }

    let updateFrame: number | null = null;

    const updateStencilScrollY = () => {
      updateFrame = null;
      setStencilScrollY(window.scrollY);
    };

    const scheduleStencilScrollYUpdate = () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      updateFrame = window.requestAnimationFrame(updateStencilScrollY);
    };

    updateStencilScrollY();

    window.addEventListener('resize', scheduleStencilScrollYUpdate);
    window.addEventListener('scroll', scheduleStencilScrollYUpdate, {
      passive: true,
    });
    window.visualViewport?.addEventListener(
      'resize',
      scheduleStencilScrollYUpdate,
    );
    window.visualViewport?.addEventListener(
      'scroll',
      scheduleStencilScrollYUpdate,
    );

    return () => {
      if (updateFrame !== null) {
        window.cancelAnimationFrame(updateFrame);
      }

      window.removeEventListener('resize', scheduleStencilScrollYUpdate);
      window.removeEventListener('scroll', scheduleStencilScrollYUpdate);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleStencilScrollYUpdate,
      );
      window.visualViewport?.removeEventListener(
        'scroll',
        scheduleStencilScrollYUpdate,
      );
    };
  }, []);

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
        `[data-cutout-layer="stencil"] ${modalBodySelector}`,
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

  return (
    <div
      ref={modalRootRef}
      className={cn(
        styles.root,
        'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 [@media_(orientation:landscape)_and_(max-height:500px)]:p-4',
      )}
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
          'relative flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden border-8 border-cutout-hole outline-none sm:h-[80dvh] sm:w-[80vw] [@media_(orientation:landscape)_and_(max-height:500px)]:h-[calc(100dvh-2rem)] [@media_(orientation:landscape)_and_(max-height:500px)]:w-[calc(100vw-2rem)]',
          customDialogClassName,
        )}
        data-ui-modal-dialog=""
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex shrink-0 justify-end border-cutout-hole border-b p-1.5 sm:p-2">
          <button
            type="button"
            aria-label={closeLabel}
            className="flex size-9 items-center justify-center rounded-full border border-cutout-hole text-cutout-hole hover:text-cutout-hole focus-visible:outline focus-visible:outline-2 focus-visible:outline-cutout-hole sm:size-11 [@media_(orientation:landscape)_and_(max-height:500px)]:size-9"
            onClick={onClose}
          >
            <X
              aria-hidden="true"
              className="size-4 sm:size-5 [@media_(orientation:landscape)_and_(max-height:500px)]:size-4"
              strokeWidth={2}
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
}
