import { afterEach, describe, expect, it, vi } from 'vitest';
import { addViewportListeners, createRafScheduler } from './viewportRaf';

function installAnimationFrameMock() {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextFrameId = 1;
  const requestAnimationFrame = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      const frameId = nextFrameId;
      nextFrameId += 1;
      callbacks.set(frameId, callback);

      return frameId;
    });
  const cancelAnimationFrame = vi
    .spyOn(window, 'cancelAnimationFrame')
    .mockImplementation((frameId) => {
      callbacks.delete(frameId);
    });

  return {
    cancelAnimationFrame,
    flush: () => {
      const pendingCallbacks = [...callbacks.entries()];

      callbacks.clear();

      for (const [frameId, callback] of pendingCallbacks) {
        callback(frameId);
      }
    },
    requestAnimationFrame,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createRafScheduler', () => {
  it('keeps the first pending frame when replacePending is false', () => {
    const raf = installAnimationFrameMock();
    const callback = vi.fn();
    const scheduler = createRafScheduler(callback);

    scheduler.schedule();
    scheduler.schedule();

    expect(raf.requestAnimationFrame).toHaveBeenCalledTimes(1);

    raf.flush();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(raf.cancelAnimationFrame).not.toHaveBeenCalled();
  });

  it('replaces the pending frame when replacePending is true', () => {
    const raf = installAnimationFrameMock();
    const callback = vi.fn();
    const scheduler = createRafScheduler(callback, { replacePending: true });

    scheduler.schedule();
    scheduler.schedule();

    expect(raf.requestAnimationFrame).toHaveBeenCalledTimes(2);
    expect(raf.cancelAnimationFrame).toHaveBeenCalledWith(1);

    raf.flush();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending frame', () => {
    const raf = installAnimationFrameMock();
    const callback = vi.fn();
    const scheduler = createRafScheduler(callback);

    scheduler.schedule();
    scheduler.cancel();
    raf.flush();

    expect(callback).not.toHaveBeenCalled();
    expect(raf.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });
});

describe('addViewportListeners', () => {
  it('subscribes to window and visual viewport events and removes them', () => {
    const listener = vi.fn();
    const visualViewport = new EventTarget();
    const originalVisualViewport = window.visualViewport;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    });

    try {
      const cleanup = addViewportListeners(listener);

      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('scroll'));
      visualViewport.dispatchEvent(new Event('resize'));
      visualViewport.dispatchEvent(new Event('scroll'));

      expect(listener).toHaveBeenCalledTimes(4);

      cleanup();

      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('scroll'));
      visualViewport.dispatchEvent(new Event('resize'));
      visualViewport.dispatchEvent(new Event('scroll'));

      expect(listener).toHaveBeenCalledTimes(4);
    } finally {
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
    }
  });
});
