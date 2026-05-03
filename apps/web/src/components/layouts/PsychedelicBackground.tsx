'use client';

import { useEffect, useRef } from 'react';
import styles from './RetroEffects.module.css';

const FRAME_INTERVAL_MS = 1000 / 30;
const MAX_PIXEL_RATIO = 1;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const RENDER_SCALE = 1;
const STATIC_TIME = 38;
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

const vertexShader = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uSeed;
uniform float uTime;
uniform vec2 uResolution;

vec3 palette(float value) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(0.92, 0.48, 0.08) + value));
}

vec2 rotate(vec2 value, float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);

  return mat2(cosine, -sine, sine, cosine) * value;
}

float hash(vec2 position) {
  return fract(sin(dot(position, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 position) {
  vec2 cell = floor(position);
  vec2 local = fract(position);
  vec2 curve = local * local * (3.0 - (2.0 * local));

  float bottomLeft = hash(cell);
  float bottomRight = hash(cell + vec2(1.0, 0.0));
  float topLeft = hash(cell + vec2(0.0, 1.0));
  float topRight = hash(cell + vec2(1.0, 1.0));

  return mix(
    mix(bottomLeft, bottomRight, curve.x),
    mix(topLeft, topRight, curve.x),
    curve.y
  );
}

float fbm(vec2 position) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int index = 0; index < 4; index++) {
    value += amplitude * noise(position);
    position = mat2(1.62, 1.18, -1.18, 1.62) * position;
    amplitude *= 0.54;
  }

  return value;
}

float ridged(float value) {
  return 1.0 - abs((value * 2.0) - 1.0);
}

float screenGrain(vec2 coord, float frame) {
  vec3 position = fract(vec3(coord, frame) * vec3(0.1031, 0.1030, 0.0973));
  position += dot(position, position.yxz + 33.33 + uSeed);

  return fract((position.x + position.y) * position.z);
}

void main() {
  vec2 position = (gl_FragCoord.xy - (0.5 * uResolution.xy)) / min(uResolution.x, uResolution.y);
  float time = uTime * 0.11;
  vec2 seed = vec2(uSeed, (uSeed * 1.37) + 9.2);
  float radius = length(position);

  vec2 slowWarp = vec2(
    fbm((position * 1.9) + seed + vec2(time * 0.29, -time * 0.21)),
    fbm((rotate(position, 1.1) * 1.7) + seed.yx + vec2(-time * 0.18, time * 0.31))
  ) - 0.5;
  vec2 quickWarp = vec2(
    fbm((position * 7.0) + (slowWarp * 3.0) + seed.yx + vec2(-time * 1.3, time * 0.83)),
    fbm((rotate(position, -0.72) * 8.6) + seed + vec2(time * 1.07, -time * 1.56))
  ) - 0.5;
  vec2 domain = position + (slowWarp * 1.15) + (quickWarp * 0.42);

  float cloudy = fbm((domain * 5.5) + (seed * 0.31) + vec2(time * 0.67, -time * 0.43));
  float voltage = fbm((rotate(domain + (slowWarp * 0.5), cloudy * 3.14) * 18.0) + seed.yx + vec2(-time * 1.7, time * 1.13));
  float dust = fbm((domain * 24.0) + (quickWarp * 4.0) + seed.yx + vec2(time * 3.4, -time * 2.7));
  float softSpark = smoothstep(0.7, 1.0, dust) * smoothstep(0.56, 1.0, voltage);
  float tear = smoothstep(
    0.58,
    0.98,
    ridged(fbm(vec2((domain.x * 11.0) + time, (domain.y * 58.0) - (time * 2.4)) + seed.yx))
  );
  float value =
    (cloudy * 0.52) +
    (voltage * 0.38) +
    (dust * 0.1);

  vec3 color = palette(value + (time * 0.09) + (uSeed * 0.013));
  vec3 acid = palette(((cloudy + voltage + dust) * 0.33) + 0.26);
  color = mix(color, acid, 0.28 + (voltage * 0.28));
  color = mix(color, vec3(0.0, 1.0, 0.82), smoothstep(0.64, 1.0, voltage) * 0.24);
  color += palette(value + 0.58) * softSpark * 0.16;

  float centerGlow = pow(1.0 - smoothstep(0.0, 1.45, radius), 1.2);
  float edgeFade = smoothstep(1.82, 0.18, radius);
  float dropout = smoothstep(0.66, 1.0, tear) * smoothstep(0.18, 1.32, radius);

  color *= 0.62 + (cloudy * 0.36) + (voltage * 0.28) + (centerGlow * 0.42);
  color = mix(color, vec3(0.006, 0.0, 0.02), dropout * 0.24);
  color = mix(vec3(0.01, 0.0, 0.032), color, edgeFade);
  // Quantize time so the grain flickers in place instead of drifting.
  float grainFrame = floor(uTime * 18.0);
  color += (screenGrain(gl_FragCoord.xy, grainFrame) - 0.5) * 0.035;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 0.96);
}
`;

const webgpuShader = `
struct Uniforms {
  time: f32,
  seed: f32,
  resolution: vec2<f32>,
};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  let positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );

  output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);

  return output;
}

fn palette(value: f32) -> vec3<f32> {
  return vec3<f32>(0.5) + (vec3<f32>(0.5) * cos(6.28318 * (vec3<f32>(0.92, 0.48, 0.08) + vec3<f32>(value))));
}

fn rotate(value: vec2<f32>, angle: f32) -> vec2<f32> {
  let sine = sin(angle);
  let cosine = cos(angle);

  return vec2<f32>(
    (value.x * cosine) + (value.y * sine),
    (-value.x * sine) + (value.y * cosine)
  );
}

fn hash(position: vec2<f32>) -> f32 {
  return fract(sin(dot(position, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn noise(position: vec2<f32>) -> f32 {
  let cell = floor(position);
  let local = fract(position);
  let curve = local * local * (vec2<f32>(3.0) - (vec2<f32>(2.0) * local));

  let bottomLeft = hash(cell);
  let bottomRight = hash(cell + vec2<f32>(1.0, 0.0));
  let topLeft = hash(cell + vec2<f32>(0.0, 1.0));
  let topRight = hash(cell + vec2<f32>(1.0, 1.0));

  return mix(
    mix(bottomLeft, bottomRight, curve.x),
    mix(topLeft, topRight, curve.x),
    curve.y
  );
}

fn fbm(position: vec2<f32>) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var current = position;

  for (var index = 0; index < 4; index = index + 1) {
    value = value + (amplitude * noise(current));
    current = mat2x2<f32>(
      vec2<f32>(1.62, 1.18),
      vec2<f32>(-1.18, 1.62)
    ) * current;
    amplitude = amplitude * 0.54;
  }

  return value;
}

fn ridged(value: f32) -> f32 {
  return 1.0 - abs((value * 2.0) - 1.0);
}

fn screenGrain(coord: vec2<f32>, frame: f32) -> f32 {
  var position = fract(vec3<f32>(coord, frame) * vec3<f32>(0.1031, 0.1030, 0.0973));
  position = position + vec3<f32>(dot(position, position.yxz + vec3<f32>(33.33 + uniforms.seed)));

  return fract((position.x + position.y) * position.z);
}

@fragment
fn fragmentMain(@builtin(position) fragmentPosition: vec4<f32>) -> @location(0) vec4<f32> {
  let coord = vec2<f32>(fragmentPosition.x, uniforms.resolution.y - fragmentPosition.y);
  let position = (coord - (uniforms.resolution * 0.5)) / min(uniforms.resolution.x, uniforms.resolution.y);
  let time = uniforms.time * 0.11;
  let seed = vec2<f32>(uniforms.seed, (uniforms.seed * 1.37) + 9.2);
  let radius = length(position);

  let slowWarp = vec2<f32>(
    fbm((position * 1.9) + seed + vec2<f32>(time * 0.29, -time * 0.21)),
    fbm((rotate(position, 1.1) * 1.7) + seed.yx + vec2<f32>(-time * 0.18, time * 0.31))
  ) - vec2<f32>(0.5);
  let quickWarp = vec2<f32>(
    fbm((position * 7.0) + (slowWarp * 3.0) + seed.yx + vec2<f32>(-time * 1.3, time * 0.83)),
    fbm((rotate(position, -0.72) * 8.6) + seed + vec2<f32>(time * 1.07, -time * 1.56))
  ) - vec2<f32>(0.5);
  let domain = position + (slowWarp * 1.15) + (quickWarp * 0.42);

  let cloudy = fbm((domain * 5.5) + (seed * 0.31) + vec2<f32>(time * 0.67, -time * 0.43));
  let voltage = fbm((rotate(domain + (slowWarp * 0.5), cloudy * 3.14) * 18.0) + seed.yx + vec2<f32>(-time * 1.7, time * 1.13));
  let dust = fbm((domain * 24.0) + (quickWarp * 4.0) + seed.yx + vec2<f32>(time * 3.4, -time * 2.7));
  let softSpark = smoothstep(0.7, 1.0, dust) * smoothstep(0.56, 1.0, voltage);
  let tear = smoothstep(
    0.58,
    0.98,
    ridged(fbm(vec2<f32>((domain.x * 11.0) + time, (domain.y * 58.0) - (time * 2.4)) + seed.yx))
  );
  let value = (cloudy * 0.52) + (voltage * 0.38) + (dust * 0.1);

  var color = palette(value + (time * 0.09) + (uniforms.seed * 0.013));
  let acid = palette(((cloudy + voltage + dust) * 0.33) + 0.26);
  color = mix(color, acid, 0.28 + (voltage * 0.28));
  color = mix(color, vec3<f32>(0.0, 1.0, 0.82), smoothstep(0.64, 1.0, voltage) * 0.24);
  color = color + (palette(value + 0.58) * softSpark * 0.16);

  let centerGlow = pow(1.0 - smoothstep(0.0, 1.45, radius), 1.2);
  let edgeFade = smoothstep(1.82, 0.18, radius);
  let dropout = smoothstep(0.66, 1.0, tear) * smoothstep(0.18, 1.32, radius);

  color = color * (0.62 + (cloudy * 0.36) + (voltage * 0.28) + (centerGlow * 0.42));
  color = mix(color, vec3<f32>(0.006, 0.0, 0.02), dropout * 0.24);
  color = mix(vec3<f32>(0.01, 0.0, 0.032), color, edgeFade);

  let grainFrame = floor(uniforms.time * 18.0);
  color = color + ((screenGrain(coord, grainFrame) - 0.5) * 0.035);
  color = clamp(color, vec3<f32>(0.0), vec3<f32>(1.0));

  let alpha = 0.96;

  return vec4<f32>(color * alpha, alpha);
}
`;

type BackgroundRenderer = {
  dispose: () => void;
  render: (time: number) => void;
  resize: () => void;
};

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

async function createWebgpuRenderer(container: HTMLDivElement) {
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
  const uniformData = new Float32Array(4);
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
  const seed = Math.random() * 1000;
  let drawingHeight = 0;
  let drawingWidth = 0;

  canvas.className = styles.psychedelicCanvas;
  container.appendChild(canvas);

  const resize = () => {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const renderWidth = Math.max(
      1,
      Math.round(width * RENDER_SCALE * pixelRatio),
    );
    const renderHeight = Math.max(
      1,
      Math.round(height * RENDER_SCALE * pixelRatio),
    );

    if (drawingWidth === renderWidth && drawingHeight === renderHeight) {
      return;
    }

    drawingWidth = renderWidth;
    drawingHeight = renderHeight;
    canvas.width = renderWidth;
    canvas.height = renderHeight;
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

function createWebglRenderer(container: HTMLDivElement) {
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

  if (
    positionLocation < 0 ||
    resolutionLocation === null ||
    seedLocation === null
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

  const seed = Math.random() * 1000;
  let drawingHeight = 0;
  let drawingWidth = 0;
  const activateProgram = gl.useProgram.bind(gl);

  canvas.className = styles.psychedelicCanvas;
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
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    const renderWidth = Math.max(
      1,
      Math.round(width * RENDER_SCALE * pixelRatio),
    );
    const renderHeight = Math.max(
      1,
      Math.round(height * RENDER_SCALE * pixelRatio),
    );

    if (drawingWidth === renderWidth && drawingHeight === renderHeight) {
      return;
    }

    drawingWidth = renderWidth;
    drawingHeight = renderHeight;
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    gl.viewport(0, 0, renderWidth, renderHeight);
    gl.uniform2f(resolutionLocation, renderWidth, renderHeight);
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

export function PsychedelicBackground() {
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
      const renderer =
        (await createWebgpuRenderer(container)) ??
        createWebglRenderer(container);

      if (!renderer) {
        return;
      }

      if (isDisposed) {
        renderer.dispose();
        return;
      }

      const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      const startTime = window.performance.now();
      let lastRenderTime = 0;
      let timeValue = reducedMotionQuery.matches ? STATIC_TIME : 0;

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
          timeValue = (currentTime - startTime) / 1000;
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

        timeValue = (window.performance.now() - startTime) / 1000;
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
      document.addEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.addEventListener('change', handleMotionChange);

      cleanupRenderer = () => {
        stop();
        window.removeEventListener('resize', renderScene);
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
  }, []);

  return (
    <div
      aria-hidden="true"
      className={styles.psychedelicBackground}
      ref={containerRef}
    />
  );
}
