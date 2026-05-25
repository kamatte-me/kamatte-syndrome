'use client';

import { useEffect, useRef } from 'react';
import fragmentShader from './shaders/psychedelic.frag.glsl?raw';
import vertexShader from './shaders/psychedelic.vert.glsl?raw';
import webgpuShader from './shaders/psychedelic.wgsl?raw';

const FRAME_INTERVAL_MS = 1000 / 30;
const MAX_PIXEL_RATIO = 1;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const RENDER_SCALE = 1;
const STATIC_TIME = 38;
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

type BackgroundRenderer = {
  dispose: () => void;
  render: (time: number) => void;
  resize: () => void;
};

type BackgroundRendererOptions = {
  seed: number;
  viewportLocked: boolean;
};

type PsychedelicBackgroundProps = {
  className?: string;
  viewportLocked?: boolean;
};

type RenderMetrics = {
  renderHeight: number;
  renderWidth: number;
  viewportHeight: number;
  viewportOriginX: number;
  viewportOriginY: number;
  viewportWidth: number;
};

const defaultBackgroundClassName =
  'pointer-events-none fixed inset-0 z-0 h-[100lvh] w-full overflow-hidden bg-black';

let sharedSeed: number | null = null;

function getSharedSeed() {
  sharedSeed ??= Math.random() * 1000;

  return sharedSeed;
}

function getRenderMetrics(
  container: HTMLDivElement,
  viewportLocked: boolean,
): RenderMetrics {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const scale = RENDER_SCALE * pixelRatio;
  const viewportWidth = Math.max(1, Math.round(window.innerWidth * scale));
  const viewportHeight = Math.max(1, Math.round(window.innerHeight * scale));

  if (viewportLocked) {
    const rect = container.getBoundingClientRect();
    const cssWidth = rect.width || container.clientWidth || window.innerWidth;
    const cssHeight =
      rect.height || container.clientHeight || window.innerHeight;

    return {
      renderHeight: Math.max(1, Math.round(cssHeight * scale)),
      renderWidth: Math.max(1, Math.round(cssWidth * scale)),
      viewportHeight,
      viewportOriginX: Math.round(rect.left * scale),
      viewportOriginY: Math.round((window.innerHeight - rect.bottom) * scale),
      viewportWidth,
    };
  }

  const cssWidth = container.clientWidth || window.innerWidth;
  const cssHeight = container.clientHeight || window.innerHeight;
  const renderWidth = Math.max(1, Math.round(cssWidth * scale));
  const renderHeight = Math.max(1, Math.round(cssHeight * scale));

  return {
    renderHeight,
    renderWidth,
    viewportHeight: renderHeight,
    viewportOriginX: 0,
    viewportOriginY: 0,
    viewportWidth: renderWidth,
  };
}

function createWebglShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createWebglProgram(gl: WebGLRenderingContext) {
  const vertex = createWebglShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = createWebglShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

  if (!vertex || !fragment) {
    if (vertex) {
      gl.deleteShader(vertex);
    }

    if (fragment) {
      gl.deleteShader(fragment);
    }

    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

async function createWebgpuRenderer(
  container: HTMLDivElement,
  { seed, viewportLocked }: BackgroundRendererOptions,
) {
  const gpu = navigator.gpu;

  if (!gpu) {
    return null;
  }

  const adapter = await gpu
    .requestAdapter({ powerPreference: 'low-power' })
    .catch(() => null);

  if (!adapter) {
    return null;
  }

  const device = await adapter.requestDevice().catch(() => null);

  if (!device) {
    return null;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgpu');

  if (!context) {
    return null;
  }

  const format = gpu.getPreferredCanvasFormat();
  const uniformData = new Float32Array(8);
  const uniformBuffer = device.createBuffer({
    size: uniformData.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  });
  const shaderModule = device.createShaderModule({ code: webgpuShader });
  const pipeline = await device
    .createRenderPipelineAsync({
      fragment: {
        entryPoint: 'fragmentMain',
        module: shaderModule,
        targets: [{ format }],
      },
      layout: 'auto',
      primitive: { topology: 'triangle-list' },
      vertex: {
        entryPoint: 'vertexMain',
        module: shaderModule,
      },
    })
    .catch(() => null);

  if (!pipeline) {
    uniformBuffer.destroy();
    return null;
  }

  const bindGroup = device.createBindGroup({
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    layout: pipeline.getBindGroupLayout(0),
  });
  let drawingHeight = 0;
  let drawingWidth = 0;
  let viewportHeight = 0;
  let viewportOriginX = 0;
  let viewportOriginY = 0;
  let viewportWidth = 0;

  canvas.className = 'absolute inset-0 block size-full opacity-[0.94]';
  container.appendChild(canvas);

  const resize = () => {
    const metrics = getRenderMetrics(container, viewportLocked);

    viewportHeight = metrics.viewportHeight;
    viewportOriginX = metrics.viewportOriginX;
    viewportOriginY = metrics.viewportOriginY;
    viewportWidth = metrics.viewportWidth;

    if (
      drawingWidth === metrics.renderWidth &&
      drawingHeight === metrics.renderHeight
    ) {
      return;
    }

    drawingWidth = metrics.renderWidth;
    drawingHeight = metrics.renderHeight;
    canvas.width = metrics.renderWidth;
    canvas.height = metrics.renderHeight;
    context.configure({
      alphaMode: 'premultiplied',
      device,
      format,
    });
  };

  const render = (time: number) => {
    if (drawingWidth === 0 || drawingHeight === 0) {
      return;
    }

    uniformData[0] = time;
    uniformData[1] = seed;
    uniformData[2] = drawingWidth;
    uniformData[3] = drawingHeight;
    uniformData[4] = viewportWidth;
    uniformData[5] = viewportHeight;
    uniformData[6] = viewportOriginX;
    uniformData[7] = viewportOriginY;
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          clearValue: { a: 0, b: 0, g: 0, r: 0 },
          loadOp: 'clear',
          storeOp: 'store',
          view: context.getCurrentTexture().createView(),
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    device.queue.submit([encoder.finish()]);
  };

  return {
    dispose: () => {
      uniformBuffer.destroy();
      canvas.remove();
    },
    render,
    resize,
  } satisfies BackgroundRenderer;
}

function createWebglRenderer(
  container: HTMLDivElement,
  { seed, viewportLocked }: BackgroundRendererOptions,
) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  });

  if (!gl) {
    return null;
  }

  const program = createWebglProgram(gl);

  if (!program) {
    return null;
  }

  const positionLocation = gl.getAttribLocation(program, 'aPosition');
  const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
  const seedLocation = gl.getUniformLocation(program, 'uSeed');
  const viewportOriginLocation = gl.getUniformLocation(
    program,
    'uViewportOrigin',
  );
  const viewportResolutionLocation = gl.getUniformLocation(
    program,
    'uViewportResolution',
  );

  if (
    positionLocation < 0 ||
    resolutionLocation === null ||
    seedLocation === null ||
    viewportOriginLocation === null ||
    viewportResolutionLocation === null
  ) {
    gl.deleteProgram(program);
    return null;
  }

  const timeLocation = gl.getUniformLocation(program, 'uTime');

  if (timeLocation === null) {
    gl.deleteProgram(program);
    return null;
  }

  const vertexBuffer = gl.createBuffer();

  if (!vertexBuffer) {
    gl.deleteProgram(program);
    return null;
  }

  let drawingHeight = 0;
  let drawingWidth = 0;
  const activateProgram = gl.useProgram.bind(gl);

  canvas.className = 'absolute inset-0 block size-full opacity-[0.94]';
  container.appendChild(canvas);

  activateProgram(program);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(seedLocation, seed);

  const resize = () => {
    const metrics = getRenderMetrics(container, viewportLocked);

    gl.uniform2f(
      viewportOriginLocation,
      metrics.viewportOriginX,
      metrics.viewportOriginY,
    );
    gl.uniform2f(
      viewportResolutionLocation,
      metrics.viewportWidth,
      metrics.viewportHeight,
    );

    if (
      drawingWidth === metrics.renderWidth &&
      drawingHeight === metrics.renderHeight
    ) {
      return;
    }

    drawingWidth = metrics.renderWidth;
    drawingHeight = metrics.renderHeight;
    canvas.width = metrics.renderWidth;
    canvas.height = metrics.renderHeight;
    gl.viewport(0, 0, metrics.renderWidth, metrics.renderHeight);
    gl.uniform2f(resolutionLocation, metrics.renderWidth, metrics.renderHeight);
  };

  const render = (time: number) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(timeLocation, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return {
    dispose: () => {
      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
      canvas.remove();
    },
    render,
    resize,
  } satisfies BackgroundRenderer;
}

export function PsychedelicBackground({
  className = defaultBackgroundClassName,
  viewportLocked = false,
}: PsychedelicBackgroundProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let cleanupRenderer: (() => void) | null = null;
    let frameId: number | null = null;
    let isDisposed = false;

    const stop = () => {
      if (frameId === null) {
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const initialize = async () => {
      const rendererOptions = {
        seed: getSharedSeed(),
        viewportLocked,
      };
      const renderer =
        (await createWebgpuRenderer(container, rendererOptions)) ??
        createWebglRenderer(container, rendererOptions);

      if (!renderer) {
        return;
      }

      if (isDisposed) {
        renderer.dispose();
        return;
      }

      const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      let lastRenderTime = 0;
      let timeValue = reducedMotionQuery.matches
        ? STATIC_TIME
        : window.performance.now() / 1000;

      const renderScene = () => {
        renderer.resize();
        renderer.render(timeValue);
      };

      const tick = (currentTime: number) => {
        if (document.hidden || reducedMotionQuery.matches) {
          frameId = null;
          return;
        }

        if (currentTime - lastRenderTime >= FRAME_INTERVAL_MS) {
          timeValue = currentTime / 1000;
          renderScene();
          lastRenderTime = currentTime;
        }

        frameId = window.requestAnimationFrame(tick);
      };

      const start = () => {
        if (frameId !== null || document.hidden || reducedMotionQuery.matches) {
          return;
        }

        frameId = window.requestAnimationFrame(tick);
      };

      const renderStaticFrame = () => {
        lastRenderTime = 0;
        timeValue = STATIC_TIME;
        renderScene();
      };

      const handleMotionChange = () => {
        stop();

        if (reducedMotionQuery.matches) {
          renderStaticFrame();
          return;
        }

        timeValue = window.performance.now() / 1000;
        renderScene();
        start();
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stop();
          return;
        }

        handleMotionChange();
      };

      renderScene();

      if (reducedMotionQuery.matches) {
        renderStaticFrame();
      } else {
        start();
      }

      window.addEventListener('resize', renderScene);
      if (viewportLocked) {
        window.addEventListener('scroll', renderScene, { passive: true });
      }
      document.addEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.addEventListener('change', handleMotionChange);

      cleanupRenderer = () => {
        stop();
        window.removeEventListener('resize', renderScene);
        if (viewportLocked) {
          window.removeEventListener('scroll', renderScene);
        }
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        reducedMotionQuery.removeEventListener('change', handleMotionChange);
        renderer.dispose();
      };
    };

    void initialize();

    return () => {
      isDisposed = true;
      cleanupRenderer?.();
    };
  }, [viewportLocked]);

  return <div aria-hidden="true" className={className} ref={containerRef} />;
}
