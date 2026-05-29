import contentCollections from '@content-collections/vite';
import { remarkGfmSubset } from '@kamatte-syndrome/remark-gfm-subset';
import { remarkMdxUrlEmbed } from '@kamatte-syndrome/remark-mdx-url-embed';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';
import { nitro } from 'nitro/vite';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { visualizer } from 'rollup-plugin-visualizer';
/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
            remarkBreaks,
            remarkGfmSubset,
            remarkMdxUrlEmbed,
          ],
        }),
      },
      contentCollections({
        environment: 'ssr',
        isEnabled: () => !isTest,
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
      mode === 'analyze' && {
        ...(visualizer() as Plugin),
        applyToEnvironment: (environment) => environment.name === 'client',
      },
    ],
    resolve: {
      tsconfigPaths: true,
      preserveSymlinks: isTest,
    },
    ssr: {
      // Cheerio's dependency tree ships sourcemaps with package-external
      // sourceRoot entries, which makes Vite warn during SSR dev transforms.
      external: ['cheerio'],
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
