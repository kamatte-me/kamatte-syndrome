import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
      }),
    },
    contentCollections({
      environment: 'ssr',
    }),
    devtools(),
    tailwindcss(),
    tanstackStart({
      rsc: {
        enabled: true,
      },
    }),
    rsc(),
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    process.env.VITEST !== 'true' &&
      cloudflare({
        viteEnvironment: {
          name: 'ssr',
          childEnvironments: ['rsc'],
        },
      }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
}));
