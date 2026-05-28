type RafSchedulerOptions = {
  replacePending?: boolean;
};

type ViewportListenerOptions = {
  visualViewportResize?: boolean;
  visualViewportScroll?: boolean;
  windowResize?: boolean;
  windowScroll?: boolean;
};

export function createRafScheduler(
  callback: () => void,
  { replacePending = false }: RafSchedulerOptions = {},
) {
  let frameId: number | null = null;

  const cancel = () => {
    if (frameId === null) {
      return;
    }

    window.cancelAnimationFrame(frameId);
    frameId = null;
  };

  const run = () => {
    frameId = null;
    callback();
  };

  const schedule = () => {
    if (frameId !== null) {
      if (!replacePending) {
        return;
      }

      cancel();
    }

    frameId = window.requestAnimationFrame(run);
  };

  return {
    cancel,
    schedule,
  };
}

export function addViewportListeners(
  listener: () => void,
  {
    visualViewportResize = true,
    visualViewportScroll = true,
    windowResize = true,
    windowScroll = true,
  }: ViewportListenerOptions = {},
) {
  if (windowResize) {
    window.addEventListener('resize', listener);
  }

  if (windowScroll) {
    window.addEventListener('scroll', listener, { passive: true });
  }

  if (visualViewportResize) {
    window.visualViewport?.addEventListener('resize', listener);
  }

  if (visualViewportScroll) {
    window.visualViewport?.addEventListener('scroll', listener);
  }

  return () => {
    if (windowResize) {
      window.removeEventListener('resize', listener);
    }

    if (windowScroll) {
      window.removeEventListener('scroll', listener);
    }

    if (visualViewportResize) {
      window.visualViewport?.removeEventListener('resize', listener);
    }

    if (visualViewportScroll) {
      window.visualViewport?.removeEventListener('scroll', listener);
    }
  };
}
