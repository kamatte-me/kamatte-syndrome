import contentCollections from '@content-collections/vite';
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
import { configDefaults } from 'vitest/config';
import { remarkStandaloneUrlEmbed } from './src/features/url-embeds/remark/remarkStandaloneUrlEmbed';

const sharedTestExclude = [
  ...configDefaults.exclude,
  'kamatte-syndrome-content/**',
];
const serverTestFiles = ['src/**/*.server.test.{ts,tsx}'];

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
            remarkStandaloneUrlEmbed,
          ],
        }),
      },
      !isTest &&
        contentCollections({
          environment: 'ssr',
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
      exclude: sharedTestExclude,
      setupFiles: ['./src/testing/msw.ts'],
      projects: [
        {
          extends: true,
          test: {
            name: 'node',
            environment: 'node',
            include: serverTestFiles,
          },
        },
        {
          extends: true,
          test: {
            name: 'dom',
            environment: 'happy-dom',
            include: ['src/**/*.test.{ts,tsx}'],
            exclude: [...sharedTestExclude, ...serverTestFiles],
          },
        },
      ],
    },
  };
});
