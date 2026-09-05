import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import contentCollections from '@content-collections/vite';
import { remarkGfmSubset } from '@kamatte-syndrome/remark-gfm-subset';
import { remarkMdxUrlEmbed } from '@kamatte-syndrome/remark-mdx-url-embed';
import { optimizedSocialImage } from '@kamatte-syndrome/vite-plugin-optimized-social-image';
import { optimizedResponsiveImage } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import autoprefixer from 'autoprefixer';
import { nitro } from 'nitro/vite';
import remarkBreaks from 'remark-breaks';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { visualizer } from 'rollup-plugin-visualizer';
/// <reference types="vitest/config" />
import { defineConfig, type Plugin, searchForWorkspaceRoot } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const appDirectory = fileURLToPath(new URL('.', import.meta.url));
const contentMediaDirectory = realpathSync(
  fileURLToPath(new URL('./kamatte-syndrome-content/media/', import.meta.url)),
);
const sourceDirectory = fileURLToPath(new URL('./src/', import.meta.url));

export default defineConfig(({ mode }) => {
  const isTest = process.env.VITEST === 'true';

  return {
    plugins: [
      {
        // Handle .glsl/.wgsl ?raw imports before TanStack Start's dev
        // middleware so LAN dev URLs do not fall through to the app as 404s.
        name: 'gpu-source-raw-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url || !/\.(?:glsl|wgsl)(?:\?.*)?$/.test(req.url)) {
              return next();
            }
            const requestUrl = new URL(req.url, 'http://vite.local');
            if (!requestUrl.searchParams.has('raw')) {
              return next();
            }
            let result: Awaited<ReturnType<typeof server.transformRequest>>;
            try {
              result = await server.transformRequest(req.url);
            } catch (error) {
              return next(error);
            }
            if (!result) {
              return next();
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/javascript');
            res.end(result.code);
          });
        },
      },
      {
        enforce: 'pre',
        ...mdx({
          remarkPlugins: [
            remarkFrontmatter,
            remarkMdxFrontmatter,
            remarkGfmSubset,
            remarkCjkFriendly,
            remarkBreaks,
            remarkMdxUrlEmbed,
          ],
        }),
      },
      optimizedResponsiveImage({
        enabled: !isTest,
      }),
      optimizedSocialImage({
        enabled: !isTest,
      }),
      !isTest &&
        ViteImageOptimizer({
          test: /\.svg$/i,
        }),
      contentCollections({
        environment: 'ssr',
        isEnabled: () => !isTest,
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
      mode === 'analyze' && {
        ...(visualizer() as Plugin),
        applyToEnvironment: (environment) => environment.name === 'client',
      },
    ],
    css: {
      postcss: {
        plugins: [autoprefixer()],
      },
    },
    resolve: {
      alias: [
        { find: /^@@\//, replacement: appDirectory },
        { find: /^@\//, replacement: sourceDirectory },
      ],
      tsconfigPaths: true,
      preserveSymlinks: isTest,
    },
    server: {
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), contentMediaDirectory],
      },
    },
    ssr: {
      // These server-only dependencies ship unusable sourcemaps, which makes
      // Vite warn while transforming them during SSR development.
      external: ['cheerio', 'feed'],
    },
    test: {
      setupFiles: ['src/testing/setup-tests.ts'],
      projects: [
        {
          test: {
            name: 'node',
            environment: 'node',
            include: ['src/**/*.server.test.{ts,tsx}'],
          },
        },
        {
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
