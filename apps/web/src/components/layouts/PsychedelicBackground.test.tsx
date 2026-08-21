import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PsychedelicBackground } from './PsychedelicBackground';

describe('PsychedelicBackground', () => {
  it('keeps the background shell available when no GPU renderer can be created', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => null);

    try {
      const { container } = render(<PsychedelicBackground />);
      const background = container.firstElementChild;

      expect(background).toHaveAttribute('aria-hidden', 'true');
      expect(background).toHaveClass(
        'fixed',
        'bg-black',
        'pointer-events-none',
      );
      expect(background?.querySelector('canvas')).toBeNull();
    } finally {
      getContext.mockRestore();
    }
  });

  it('uses a caller-provided class name for a scoped background', () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(() => null);

    try {
      const { container } = render(
        <PsychedelicBackground className="custom-background relative" />,
      );

      expect(container.firstElementChild).toHaveClass(
        'relative',
        'custom-background',
      );
    } finally {
      getContext.mockRestore();
    }
  });

  it('reinitializes the WebGL renderer after its context is lost', async () => {
    const originalMatchMedia = window.matchMedia;
    const originalResizeObserver = globalThis.ResizeObserver;
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    const webglContext = {
      ARRAY_BUFFER: 34962,
      COLOR_BUFFER_BIT: 16384,
      COMPILE_STATUS: 35713,
      CULL_FACE: 2884,
      DEPTH_TEST: 2929,
      FLOAT: 5126,
      FRAGMENT_SHADER: 35632,
      LINK_STATUS: 35714,
      SCISSOR_TEST: 3089,
      STATIC_DRAW: 35044,
      TRIANGLES: 4,
      VERTEX_SHADER: 35633,
      attachShader: vi.fn(),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      clear: vi.fn(),
      clearColor: vi.fn(),
      compileShader: vi.fn(),
      createBuffer: vi.fn(() => ({})),
      createProgram: vi.fn(() => ({})),
      createShader: vi.fn(() => ({})),
      deleteBuffer: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      disable: vi.fn(),
      drawArrays: vi.fn(),
      enable: vi.fn(),
      enableVertexAttribArray: vi.fn(),
      getAttribLocation: vi.fn(() => 0),
      getProgramParameter: vi.fn(() => true),
      getShaderParameter: vi.fn(() => true),
      getUniformLocation: vi.fn(() => ({})),
      linkProgram: vi.fn(),
      scissor: vi.fn(),
      shaderSource: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      useProgram: vi.fn(),
      vertexAttribPointer: vi.fn(),
      viewport: vi.fn(),
    } as unknown as WebGLRenderingContext;
    const getContext = vi.fn(() => webglContext);

    class ResizeObserverMock {
      disconnect() {}

      observe() {}
    }

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: getContext,
    });
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    try {
      const { container } = render(<PsychedelicBackground />);

      await waitFor(() => {
        expect(container.querySelector('canvas')).not.toBeNull();
      });

      const canvas = container.querySelector('canvas');

      if (!canvas) {
        throw new Error('Expected the WebGL renderer canvas to exist');
      }

      const contextLost = new Event('webglcontextlost', { cancelable: true });
      canvas.dispatchEvent(contextLost);

      await waitFor(() => {
        expect(getContext).toHaveBeenCalledTimes(2);
      });

      expect(contextLost.defaultPrevented).toBe(true);
    } finally {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: originalGetContext,
      });
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: originalMatchMedia,
      });
      vi.stubGlobal('ResizeObserver', originalResizeObserver);
    }
  });
});
