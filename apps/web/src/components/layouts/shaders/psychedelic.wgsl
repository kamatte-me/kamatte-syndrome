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
  let dropout = smoothstep(0.66, 1.0, tear) * smoothstep(0.18, 1.32, radius);

  color = color * (0.62 + (cloudy * 0.36) + (voltage * 0.28) + (centerGlow * 0.42));
  color = mix(color, vec3<f32>(0.006, 0.0, 0.02), dropout * 0.24);

  let grainFrame = floor(uniforms.time * 18.0);
  color = color + ((screenGrain(coord, grainFrame) - 0.5) * 0.035);
  color = clamp(color, vec3<f32>(0.0), vec3<f32>(1.0));

  let alpha = 0.96;

  return vec4<f32>(color * alpha, alpha);
}
