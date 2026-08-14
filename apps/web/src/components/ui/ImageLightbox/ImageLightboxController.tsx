import { useNavigate } from '@tanstack/react-router';
import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ImageLightbox } from './ImageLightbox';
import { imageLightboxTriggerSelector } from './ImageLightboxTrigger';

const contentLayerSelector = '[data-cutout-layer="content"]';
const imageLightboxHistoryStateKey = 'imageLightbox';
const maximumTapMovement = 12;

type LightboxImage = {
  alt: string;
  height: number;
  src: string;
  width: number;
};

export type ImageLightboxControllerProps = {
  children: ReactNode;
};

type TrackedTouchPointer = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startScrollX: number;
  startScrollY: number;
  trigger: HTMLButtonElement;
};

function getImageDimensions(image: HTMLImageElement | null) {
  if (!image) {
    return { height: 1, width: 1 };
  }

  const width = Number(image.getAttribute('width'));
  const height = Number(image.getAttribute('height'));

  if (width > 0 && height > 0) {
    return { height, width };
  }

  if (image.naturalWidth > 0 && image.naturalHeight > 0) {
    return { height: image.naturalHeight, width: image.naturalWidth };
  }

  const rect = image.getBoundingClientRect();

  if (rect.width > 0 && rect.height > 0) {
    return { height: rect.height, width: rect.width };
  }

  return { height: 1, width: 1 };
}

function getLightboxImage(trigger: HTMLButtonElement) {
  const src = trigger.dataset.imageLightboxSrc;

  if (!src) {
    return null;
  }

  const image = trigger.querySelector('img');

  return {
    alt: image?.alt ?? '',
    ...getImageDimensions(image),
    src,
  } satisfies LightboxImage;
}

function isPointInsideTrigger(
  trigger: HTMLButtonElement,
  clientX: number,
  clientY: number,
) {
  const rect = trigger.getBoundingClientRect();

  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

function getLightboxTrigger(
  target: EventTarget | null,
  controller: HTMLDivElement,
) {
  if (!(target instanceof Element)) {
    return null;
  }

  const trigger = target.closest<HTMLButtonElement>(
    imageLightboxTriggerSelector,
  );

  if (
    !trigger ||
    trigger.disabled ||
    !controller.contains(trigger) ||
    trigger.closest('a')
  ) {
    return null;
  }

  return trigger;
}

function hasTouchPointerMoved(
  pointer: TrackedTouchPointer,
  event: ReactPointerEvent<HTMLDivElement>,
) {
  return (
    Math.hypot(
      event.clientX - pointer.startClientX,
      event.clientY - pointer.startClientY,
    ) > maximumTapMovement ||
    Math.hypot(
      window.scrollX - pointer.startScrollX,
      window.scrollY - pointer.startScrollY,
    ) > maximumTapMovement
  );
}

export function ImageLightboxController({
  children,
}: ImageLightboxControllerProps) {
  const navigate = useNavigate();
  const openerRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const suppressedClickRef = useRef<HTMLButtonElement | null>(null);
  const trackedTouchPointerRef = useRef<TrackedTouchPointer | null>(null);
  const [selectedImage, setSelectedImage] = useState<LightboxImage | null>(
    null,
  );

  const closeLightbox = useCallback(() => {
    if (
      selectedImage &&
      window.history.state?.[imageLightboxHistoryStateKey] === selectedImage.src
    ) {
      window.history.back();
      return;
    }

    setSelectedImage(null);
  }, [selectedImage]);

  const openLightbox = useCallback(
    (trigger: HTMLButtonElement) => {
      const image = getLightboxImage(trigger);

      if (!image) {
        return;
      }

      openerRef.current = trigger;
      setSelectedImage(image);
      void navigate({
        to: '.',
        state: (previous) => ({
          ...previous,
          [imageLightboxHistoryStateKey]: image.src,
        }),
        resetScroll: false,
      });
    },
    [navigate],
  );

  useEffect(() => {
    const controller = rootRef.current;

    if (!controller?.closest(contentLayerSelector)) {
      return;
    }

    const closeLightboxOnPopState = () => {
      setSelectedImage(null);
    };

    window.addEventListener('popstate', closeLightboxOnPopState);

    return () => {
      window.removeEventListener('popstate', closeLightboxOnPopState);
    };
  }, []);

  const handleContentClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const controller = rootRef.current;

      if (!controller?.closest(contentLayerSelector)) {
        return;
      }

      const trigger = getLightboxTrigger(event.target, controller);

      if (!trigger) {
        return;
      }

      if (event.detail !== 0 && suppressedClickRef.current === trigger) {
        suppressedClickRef.current = null;
        return;
      }

      suppressedClickRef.current = null;
      openLightbox(trigger);
    },
    [openLightbox],
  );

  const handlePointerDownCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const controller = rootRef.current;

      if (!controller?.closest(contentLayerSelector)) {
        return;
      }

      const directTrigger = getLightboxTrigger(event.target, controller);

      if (event.pointerType === 'mouse') {
        if (suppressedClickRef.current === directTrigger) {
          suppressedClickRef.current = null;
        }
        return;
      }

      if (
        event.pointerType !== 'touch' ||
        !event.isPrimary ||
        trackedTouchPointerRef.current
      ) {
        return;
      }

      if (!directTrigger) {
        return;
      }

      const trackedPointer = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startScrollX: window.scrollX,
        startScrollY: window.scrollY,
        trigger: directTrigger,
      } satisfies TrackedTouchPointer;

      trackedTouchPointerRef.current = trackedPointer;
    },
    [],
  );

  const handlePointerMoveCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = trackedTouchPointerRef.current;

      if (
        pointer?.pointerId === event.pointerId &&
        hasTouchPointerMoved(pointer, event)
      ) {
        trackedTouchPointerRef.current = null;
      }
    },
    [],
  );

  const handlePointerCancelCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = trackedTouchPointerRef.current;

      if (pointer?.pointerId === event.pointerId) {
        trackedTouchPointerRef.current = null;
      }
    },
    [],
  );

  const handlePointerUpCapture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const pointer = trackedTouchPointerRef.current;

      if (pointer?.pointerId !== event.pointerId) {
        return;
      }

      trackedTouchPointerRef.current = null;

      if (
        hasTouchPointerMoved(pointer, event) ||
        !rootRef.current?.contains(pointer.trigger) ||
        !isPointInsideTrigger(pointer.trigger, event.clientX, event.clientY)
      ) {
        return;
      }

      suppressedClickRef.current = pointer.trigger;
      openLightbox(pointer.trigger);
    },
    [openLightbox],
  );

  return (
    <div className="flex flex-col">
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: Events are delegated from native image buttons, including a touch pointer fallback for Android browsers that omit the synthesized click. */}
      <div
        ref={rootRef}
        onClick={handleContentClick}
        onPointerCancelCapture={handlePointerCancelCapture}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMoveCapture={handlePointerMoveCapture}
        onPointerUpCapture={handlePointerUpCapture}
      >
        {children}
      </div>

      {selectedImage ? (
        <ImageLightbox
          {...selectedImage}
          onClose={closeLightbox}
          returnFocusElement={openerRef.current}
        />
      ) : null}
    </div>
  );
}
