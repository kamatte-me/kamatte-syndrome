'use client';

import { useEffect, useRef } from 'react';
import styles from './RetroEffects.module.css';

const FRAME_INTERVAL_MS = 1000 / 30;
const MAX_PIXEL_RATIO = 1;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const RENDER_SCALE = 1;
const STATIC_TIME = 38;

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uSeed;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

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

export function PsychedelicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isDisposed = false;
    let cleanupWebgl: (() => void) | null = null;
    let frameId: number | null = null;

    const stop = () => {
      if (frameId === null) {
        return;
      }

      window.cancelAnimationFrame(frameId);
      frameId = null;
    };

    const initialize = async () => {
      const threeModules = await Promise.all([
        import('three/src/renderers/WebGLRenderer.js'),
        import('three/src/scenes/Scene.js'),
        import('three/src/cameras/OrthographicCamera.js'),
        import('three/src/math/Vector2.js'),
        import('three/src/geometries/PlaneGeometry.js'),
        import('three/src/materials/ShaderMaterial.js'),
        import('three/src/objects/Mesh.js'),
        import('three/src/core/Clock.js'),
      ]).catch(() => null);

      if (!threeModules || isDisposed) {
        return;
      }

      const [
        { WebGLRenderer },
        { Scene },
        { OrthographicCamera },
        { Vector2 },
        { PlaneGeometry },
        { ShaderMaterial },
        { Mesh },
        { Clock },
      ] = threeModules;
      const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
      let renderer: InstanceType<typeof WebGLRenderer>;

      try {
        renderer = new WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        });
      } catch {
        return;
      }

      const scene = new Scene();
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const resolution = new Vector2(1, 1);
      const uniforms = {
        uResolution: { value: resolution },
        uSeed: { value: Math.random() * 1000 },
        uTime: { value: reducedMotionQuery.matches ? STATIC_TIME : 0 },
      };
      const geometry = new PlaneGeometry(2, 2);
      const material = new ShaderMaterial({
        depthTest: false,
        depthWrite: false,
        fragmentShader,
        uniforms,
        vertexShader,
      });
      const mesh = new Mesh(geometry, material);
      const clock = new Clock();
      let lastRenderTime = 0;

      scene.add(mesh);
      renderer.domElement.className = styles.psychedelicCanvas;
      container.appendChild(renderer.domElement);

      const renderScene = () => {
        renderer.render(scene, camera);
      };

      const resize = () => {
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        const pixelRatio = Math.min(
          window.devicePixelRatio || 1,
          MAX_PIXEL_RATIO,
        );
        const renderWidth = Math.max(1, Math.round(width * RENDER_SCALE));
        const renderHeight = Math.max(1, Math.round(height * RENDER_SCALE));

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(renderWidth, renderHeight, false);
        renderer.getDrawingBufferSize(resolution);
        renderScene();
      };

      const tick = (currentTime: number) => {
        if (document.hidden || reducedMotionQuery.matches) {
          frameId = null;
          return;
        }

        if (currentTime - lastRenderTime >= FRAME_INTERVAL_MS) {
          uniforms.uTime.value = clock.getElapsedTime();
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
        uniforms.uTime.value = STATIC_TIME;
        renderScene();
      };

      const handleMotionChange = () => {
        stop();

        if (reducedMotionQuery.matches) {
          renderStaticFrame();
          return;
        }

        start();
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stop();
          return;
        }

        handleMotionChange();
      };

      resize();

      if (reducedMotionQuery.matches) {
        renderStaticFrame();
      } else {
        start();
      }

      window.addEventListener('resize', resize);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.addEventListener('change', handleMotionChange);

      cleanupWebgl = () => {
        stop();
        window.removeEventListener('resize', resize);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        reducedMotionQuery.removeEventListener('change', handleMotionChange);
        mesh.removeFromParent();
        material.dispose();
        geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    void initialize();

    return () => {
      isDisposed = true;
      cleanupWebgl?.();
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
