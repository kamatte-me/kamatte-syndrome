import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    codeSplitting: false,
    file: 'dist/index.js',
    format: 'esm',
    minify: false,
    sourcemap: true,
  },
  platform: 'node',
  transform: {
    target: 'node24',
  },
});
