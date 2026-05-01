import contentCollections from '@content-collections/vite';
import { remarkGfmSubset } from '@kamatte-syndrome/remark-gfm-subset';
import { remarkUrlEmbed } from '@kamatte-syndrome/remark-url-embed';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import { nitro } from 'nitro/vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const isTest = process.env.VITEST === 'true' || mode === 'test';

  return {
    plugins: [
      {
        enforce: 'pre',
        ...mdx({
          remarkPlugins: [
            remarkFrontmatter,
            remarkMdxFrontmatter,
            remarkGfmSubset,
            remarkUrlEmbed,
          ],
        }),
      },
      !isTest &&
        contentCollections({
          environment: 'ssr',
        }),
      !isTest &&
        viteStaticCopy({
          targets: [
            {
              src: 'kamatte-syndrome-content/media/',
              dest: '../public/media',
              rename: {
                stripBase: true,
              },
            },
          ],
        }),
      !isTest && devtools(),
      tailwindcss(),
      !isTest &&
        tanstackStart({
          rsc: {
            enabled: true,
          },
        }),
      !isTest && nitro(),
      !isTest && rsc(),
      react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
    test: {
      setupFiles: ['src/testing/setup-tests.ts'],
      projects: [
        {
          extends: true,
          test: {
            name: 'node',
            environment: 'node',
            include: ['src/**/*.server.test.{ts,tsx}'],
          },
        },
        {
          extends: true,
          test: {
            name: 'dom',
            environment: 'happy-dom',
            include: ['src/**/*.test.{ts,tsx}'],
            exclude: ['src/**/*.server.test.{ts,tsx}'],
          },
        },
      ],
    },
  };
});
