import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { imagetools } from 'vite-imagetools';
import {
  type GenerateContentImagesOptions,
  generateContentImages,
} from './generateContentImages.ts';
import type { ContentImageManifest } from './types.ts';
import {
  createContentImagesVirtualModule,
  isPathInside,
  parseContentImageWidths,
  resolveContentImageSource,
  resolveContentImagesVirtualModuleId,
} from './virtualContentImages.ts';

export type {
  ContentImageEntry,
  ContentImageManifest,
  ContentImageVariant,
} from './types.ts';

export type ContentImagesPluginOptions = GenerateContentImagesOptions & {
  enabled?: boolean;
};

export function contentImages({
  enabled = true,
  ...options
}: ContentImagesPluginOptions): Plugin[] {
  let manifest: ContentImageManifest = {};
  let initialGeneration: Promise<void> | undefined;
  let devServer: ViteDevServer | undefined;
  let regeneration = Promise.resolve();
  let regenerationTimer: ReturnType<typeof setTimeout> | undefined;
  const resolvedVirtualModuleIds = new Set<string>();

  const regenerate = async () => {
    manifest = enabled ? await generateContentImages(options) : {};
  };

  const queueRegeneration = () => {
    clearTimeout(regenerationTimer);
    regenerationTimer = setTimeout(() => {
      regeneration = regeneration
        .then(regenerate)
        .then(() => {
          for (const environment of Object.values(
            devServer?.environments ?? {},
          )) {
            for (const id of resolvedVirtualModuleIds) {
              const module = environment.moduleGraph.getModuleById(id);
              if (module) {
                environment.moduleGraph.invalidateModule(module);
              }
            }
          }
          devServer?.ws.send({ type: 'full-reload' });
        })
        .catch((error: unknown) => {
          devServer?.config.logger.error(
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          );
        });
    }, 100);
  };

  const handleSourceChange = (filePath: string) => {
    if (isPathInside(options.sourceDirectory, filePath)) {
      queueRegeneration();
    }
  };

  const plugin: Plugin = {
    name: 'kamatte-syndrome-content-images',
    enforce: 'pre',
    sharedDuringBuild: true,
    async buildStart() {
      initialGeneration ??= regenerate();
      await initialGeneration;
    },
    resolveId(id) {
      const sourceId = resolveContentImageSource(id, options.sourceDirectory);
      if (sourceId) {
        return sourceId;
      }

      const resolvedId = resolveContentImagesVirtualModuleId(id);
      if (resolvedId) {
        resolvedVirtualModuleIds.add(resolvedId);
        return resolvedId;
      }
    },
    load(id) {
      const widths = parseContentImageWidths(id);
      if (widths) {
        return createContentImagesVirtualModule({
          manifest,
          publicPath: options.publicPath,
          widths,
        });
      }
    },
    configureServer(server) {
      devServer = server;
      if (!enabled) {
        return;
      }

      server.watcher.add(options.sourceDirectory);
      server.watcher.on('add', handleSourceChange);
      server.watcher.on('change', handleSourceChange);
      server.watcher.on('unlink', handleSourceChange);

      return () => {
        clearTimeout(regenerationTimer);
        server.watcher.off('add', handleSourceChange);
        server.watcher.off('change', handleSourceChange);
        server.watcher.off('unlink', handleSourceChange);
      };
    },
  };

  return [
    plugin,
    ...(enabled
      ? [
          imagetools({
            cache: {
              dir: path.join(options.cacheDirectory, 'imagetools'),
            },
          }),
        ]
      : []),
  ];
}
