import { EventEmitter } from 'node:events';
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { build, createServer, type ViteDevServer } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { imageVariants } from './index.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('imageVariants', () => {
  it('shares read-only image metadata across build environments', () => {
    const [plugin] = imageVariants({
      cacheDirectory: '/cache',
      enabled: false,
    });

    expect(plugin?.sharedDuringBuild).toBe(true);
  });

  it('keeps dev image watchers active until the server closes', async () => {
    const cacheDirectory = await createRootDirectory('image-variants-cache-');
    const [plugin] = imageVariants({ cacheDirectory });
    if (!plugin || typeof plugin.configureServer !== 'function') {
      throw new Error('Expected a configureServer hook');
    }

    const watcher = Object.assign(new EventEmitter(), {
      add() {
        return this;
      },
    });
    const httpServer = new EventEmitter();
    const server = {
      environments: {},
      httpServer,
      watcher,
      ws: { send() {} },
    } as unknown as ViteDevServer;

    const postHook = plugin.configureServer.call({} as never, server);

    expect(postHook).toBeUndefined();
    expect(watcher.listenerCount('add')).toBe(1);
    expect(watcher.listenerCount('change')).toBe(1);
    expect(watcher.listenerCount('unlink')).toBe(1);

    httpServer.emit('close');

    expect(watcher.listenerCount('add')).toBe(0);
    expect(watcher.listenerCount('change')).toBe(0);
    expect(watcher.listenerCount('unlink')).toBe(0);
  });

  it('watches the real directory behind a collection symlink', async () => {
    const rootDirectory = await realpath(
      await createRootDirectory('image-variants-root-'),
    );
    const realSourceDirectory = await realpath(
      await createRootDirectory('image-variants-source-'),
    );
    const sourceDirectory = path.join(rootDirectory, 'content-media');
    const imagePath = path.join(realSourceDirectory, 'image.png');
    await symlink(realSourceDirectory, sourceDirectory, 'dir');
    await writeTestPng(imagePath, 'red');
    const reactImageRuntimeAlias =
      await createReactImageRuntimeAlias(rootDirectory);
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import Image from 'virtual:react-image?src=./content-media/image.png&widths=40';",
        "import Images from 'virtual:react-image/collection?src=/content-media&base=/media&widths=40';",
        'console.log(Image, Images);',
        '',
      ].join('\n'),
    );

    const server = await createServer({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        imageVariants({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      root: rootDirectory,
      resolve: {
        alias: [reactImageRuntimeAlias],
      },
      server: {
        fs: { allow: [rootDirectory, realSourceDirectory] },
        middlewareMode: true,
      },
    });

    try {
      await server.transformRequest('/main.js');
      const resolvedCollectionModule =
        await server.environments.client.pluginContainer.resolveId(
          'virtual:react-image/collection?src=/content-media&base=/media&widths=40',
          path.join(rootDirectory, 'main.js'),
        );
      expect(resolvedCollectionModule).not.toBeNull();
      await expect(
        server.environments.client.transformRequest(
          resolvedCollectionModule?.id ?? '',
        ),
      ).resolves.not.toBeNull();
      const resolvedImageModule =
        await server.environments.client.pluginContainer.resolveId(
          'virtual:react-image?src=./content-media/image.png&widths=40',
          path.join(rootDirectory, 'main.js'),
        );
      expect(resolvedImageModule).not.toBeNull();
      await expect(
        server.environments.client.transformRequest(
          resolvedImageModule?.id ?? '',
        ),
      ).resolves.not.toBeNull();

      const changedPaths: string[] = [];
      server.watcher.on('change', (filePath) => changedPaths.push(filePath));
      await new Promise((resolve) => setTimeout(resolve, 100));

      await writeTestPng(imagePath, 'blue');

      await vi.waitFor(
        () => {
          expect(
            changedPaths.some((filePath) => isSamePath(filePath, imagePath)),
          ).toBe(true);
        },
        { interval: 25, timeout: 3_000 },
      );
    } finally {
      await server.close();
    }
  });

  it('builds collection widths from self-contained virtual imports', async () => {
    const rootDirectory = await createRootDirectory('image-variants-vite-');
    const contentSourceDirectory = path.join(rootDirectory, 'content-media');
    const assetSourceDirectory = path.join(rootDirectory, 'src/assets/images');
    const outputDirectory = path.join(rootDirectory, 'dist');
    const reactImageRuntimeAlias =
      await createReactImageRuntimeAlias(rootDirectory);
    await mkdir(contentSourceDirectory, { recursive: true });
    await mkdir(assetSourceDirectory, { recursive: true });
    await sharp({
      create: {
        background: { b: 180, g: 120, r: 60 },
        channels: 3,
        height: 300,
        width: 400,
      },
    })
      .jpeg()
      .toFile(path.join(contentSourceDirectory, 'photo.JPG'));
    await sharp({
      create: {
        background: { b: 30, g: 60, r: 90 },
        channels: 3,
        height: 120,
        width: 80,
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(path.join(contentSourceDirectory, 'oriented.jpg'));
    await sharp({
      create: {
        background: { b: 60, g: 120, r: 180 },
        channels: 3,
        height: 80,
        width: 100,
      },
    })
      .jpeg()
      .toFile(path.join(assetSourceDirectory, 'hoge.jpg'));
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import imageVariants from 'virtual:react-image/collection?src=@@/content-media&base=/media&widths=100;160';",
        "import compactImageVariants from 'virtual:react-image/collection?src=@@/content-media&base=/media&widths=100';",
        "import assetImages from 'virtual:react-image/collection?src=./src/assets/images&base=/app-images&widths=24;48';",
        'console.log(imageVariants, compactImageVariants, assetImages);',
        '',
      ].join('\n'),
    );

    await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: { input: path.join(rootDirectory, 'main.js') },
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        imageVariants({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      publicDir: false,
      resolve: {
        alias: [
          reactImageRuntimeAlias,
          { find: /^@@\//, replacement: `${rootDirectory}/` },
        ],
      },
      root: rootDirectory,
    });

    const assetDirectory = path.join(outputDirectory, 'assets');
    const assetFiles = await readdir(assetDirectory);
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.avif',
      [24, 48, 100, 100, 120, 160],
    );
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.webp',
      [24, 48, 100, 100, 120, 160],
    );

    const originalAssets = assetFiles.filter((file) => /\.jpe?g$/i.test(file));
    expect(originalAssets).toHaveLength(3);
    const photoAsset = await expectOriginalAsset({
      assetDirectory,
      assetFiles: originalAssets,
      sourcePath: path.join(contentSourceDirectory, 'photo.JPG'),
    });
    await expectOriginalAsset({
      assetDirectory,
      assetFiles: originalAssets,
      sourcePath: path.join(contentSourceDirectory, 'oriented.jpg'),
    });
    await expectOriginalAsset({
      assetDirectory,
      assetFiles: originalAssets,
      sourcePath: path.join(assetSourceDirectory, 'hoge.jpg'),
    });

    const bundleFile = assetFiles.find((file) => file.endsWith('.js'));
    expect(bundleFile).toBeDefined();
    const bundle = await readFile(
      path.join(assetDirectory, bundleFile ?? ''),
      'utf8',
    );
    expect(bundle).toContain('/media/photo.JPG');
    expect(bundle).toContain('/media/oriented.jpg');
    expect(bundle).toContain('/app-images/hoge.jpg');
    expect(bundle).toContain(`/assets/${photoAsset}`);
    expect(bundle).toContain('width:24');
    expect(bundle).toContain('width:48');
    expect(bundle).toContain('width:160');
    expect(bundle).toContain('width:120');
    await expect(
      access(path.join(outputDirectory, 'media/photo.JPG')),
    ).rejects.toThrow();
  });

  it('builds an importer-relative single image', async () => {
    const rootDirectory = await createRootDirectory('image-variant-vite-');
    const sourceDirectory = path.join(rootDirectory, 'src');
    const outputDirectory = path.join(rootDirectory, 'dist');
    const sourcePath = path.join(sourceDirectory, 'image.jpg');
    const reactImageRuntimeAlias =
      await createReactImageRuntimeAlias(rootDirectory);
    await mkdir(sourceDirectory, { recursive: true });
    await sharp({
      create: {
        background: { b: 180, g: 120, r: 60 },
        channels: 3,
        height: 120,
        width: 80,
      },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toFile(sourcePath);
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import image from 'virtual:react-image?src=./src/image.jpg&widths=40;100;160';",
        'console.log(image);',
        '',
      ].join('\n'),
    );

    await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: { input: path.join(rootDirectory, 'main.js') },
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        imageVariants({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      resolve: { alias: [reactImageRuntimeAlias] },
      root: rootDirectory,
    });

    const assetDirectory = path.join(outputDirectory, 'assets');
    const assetFiles = await readdir(assetDirectory);
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.avif',
      [40, 100, 120],
    );
    await expectVariantWidths(
      assetDirectory,
      assetFiles,
      '.webp',
      [40, 100, 120],
    );

    const fallbackFile = assetFiles.find((file) => /\.jpe?g$/.test(file));
    expect(fallbackFile).toBeDefined();
    await expect(
      readFile(path.join(assetDirectory, fallbackFile ?? '')),
    ).resolves.toEqual(await readFile(sourcePath));

    const bundleFile = assetFiles.find((file) => file.endsWith('.js'));
    expect(bundleFile).toBeDefined();
    const bundle = await readFile(
      path.join(assetDirectory, bundleFile ?? ''),
      'utf8',
    );
    expect(bundle).toContain('width:40');
    expect(bundle).toContain('width:100');
    expect(bundle).toContain('width:120');
    expect(bundle).toContain('height:80');
  });

  it('leaves ordinary Vite image queries untouched', async () => {
    const rootDirectory = await createRootDirectory(
      'image-variants-passthrough-',
    );
    const outputDirectory = path.join(rootDirectory, 'dist');
    await writeTestPng(path.join(rootDirectory, 'image.png'), 'red');
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      "import rawImage from './image.png?raw';\nconsole.log(rawImage);\n",
    );

    await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: { input: path.join(rootDirectory, 'main.js') },
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        imageVariants({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      publicDir: false,
      root: rootDirectory,
    });

    const assetFiles = await readdir(path.join(outputDirectory, 'assets'));
    expect(assetFiles.some((file) => file.endsWith('.png'))).toBe(false);
  });

  it('refreshes collection metadata during watch builds', async () => {
    const rootDirectory = await createRootDirectory('image-variants-watch-');
    const sourceDirectory = path.join(rootDirectory, 'content-media');
    const outputDirectory = path.join(rootDirectory, 'dist');
    const imagePath = path.join(sourceDirectory, 'image.png');
    const reactImageRuntimeAlias =
      await createReactImageRuntimeAlias(rootDirectory);
    await mkdir(sourceDirectory);
    await writeSizedPng(imagePath, 100, 50);
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import images from 'virtual:react-image/collection?src=/content-media&base=/media&widths=160';",
        'console.log(images);',
        '',
      ].join('\n'),
    );

    const buildResult = await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: {
          input: path.join(rootDirectory, 'main.js'),
          output: { entryFileNames: 'main.js' },
        },
        watch: {},
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        imageVariants({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      publicDir: false,
      resolve: { alias: [reactImageRuntimeAlias] },
      root: rootDirectory,
    });
    if (!('on' in buildResult)) {
      throw new Error('Expected a Rollup watcher');
    }
    const watcher = buildResult;
    let completedBuildCount = 0;
    const pendingBuilds: Array<{
      buildCount: number;
      reject: (error: unknown) => void;
      resolve: () => void;
    }> = [];
    watcher.on('event', (event) => {
      if (event.code === 'END') {
        completedBuildCount += 1;
        for (const pendingBuild of pendingBuilds.splice(0)) {
          if (pendingBuild.buildCount <= completedBuildCount) {
            pendingBuild.resolve();
          } else {
            pendingBuilds.push(pendingBuild);
          }
        }
      } else if (event.code === 'ERROR') {
        for (const pendingBuild of pendingBuilds.splice(0)) {
          pendingBuild.reject(event.error);
        }
      }
    });
    const waitForBuild = (buildCount: number) => {
      if (completedBuildCount >= buildCount) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(
            new Error(
              `Timed out waiting for build ${buildCount}; completed ${completedBuildCount}`,
            ),
          );
        }, 5_000);
        pendingBuilds.push({
          buildCount,
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          },
          resolve: () => {
            clearTimeout(timeout);
            resolve();
          },
        });
      });
    };
    const readBundle = () =>
      readFile(path.join(outputDirectory, 'main.js'), 'utf8');

    try {
      await waitForBuild(1);
      await expect(readBundle()).resolves.toMatch(/height:50.+width:100/);

      const resizedBuild = waitForBuild(2);
      await writeSizedPng(imagePath, 200, 70);
      await resizedBuild;
      await expect(readBundle()).resolves.toMatch(/height:70.+width:200/);
    } finally {
      await watcher.close();
    }
  }, 10_000);

  it('rejects a collection source that is not a directory', async () => {
    const rootDirectory = await createRootDirectory('image-variants-error-');
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      "import 'virtual:react-image/collection?src=/missing&base=/media&widths=320';\n",
    );

    await expect(
      build({
        build: {
          outDir: path.join(rootDirectory, 'dist'),
          rollupOptions: { input: path.join(rootDirectory, 'main.js') },
        },
        configFile: false,
        logLevel: 'silent',
        plugins: [
          imageVariants({
            cacheDirectory: path.join(rootDirectory, 'cache'),
          }),
        ],
        publicDir: false,
        root: rootDirectory,
      }),
    ).rejects.toThrow('Unable to read image source directory: /missing');
  });
});

async function createRootDirectory(prefix: string) {
  const rootDirectory = await mkdtemp(path.join(tmpdir(), prefix));
  temporaryDirectories.push(rootDirectory);
  return rootDirectory;
}

async function createReactImageRuntimeAlias(rootDirectory: string) {
  const runtimePath = path.join(rootDirectory, 'react-image-runtime.js');
  await writeFile(
    runtimePath,
    [
      'export const createReactImage = (variant) => variant;',
      'export const createReactImageCollection = (manifest) => manifest;',
      '',
    ].join('\n'),
  );
  return {
    find: '@kamatte-syndrome/vite-plugin-image-variants/react',
    replacement: runtimePath,
  };
}

async function writeTestPng(filePath: string, background: 'blue' | 'red') {
  await sharp({
    create: {
      background,
      channels: 3,
      height: 60,
      width: 80,
    },
  })
    .png()
    .toFile(filePath);
}

async function writeSizedPng(filePath: string, width: number, height: number) {
  await sharp({
    create: {
      background: 'green',
      channels: 3,
      height,
      width,
    },
  })
    .png()
    .toFile(filePath);
}

function isSamePath(firstPath: string, secondPath: string) {
  return path.resolve(firstPath) === path.resolve(secondPath);
}

async function expectVariantWidths(
  directory: string,
  files: string[],
  extension: '.avif' | '.webp',
  expectedWidths: number[],
) {
  const variantFiles = files.filter((file) => file.endsWith(extension));
  const widths = await Promise.all(
    variantFiles.map(async (file) => {
      const metadata = await sharp(path.join(directory, file)).metadata();
      return metadata.width;
    }),
  );

  expect(widths.sort((a, b) => (a ?? 0) - (b ?? 0))).toEqual(expectedWidths);
}

async function expectOriginalAsset({
  assetDirectory,
  assetFiles,
  sourcePath,
}: Readonly<{
  assetDirectory: string;
  assetFiles: readonly string[];
  sourcePath: string;
}>) {
  const sourceExtension = path.extname(sourcePath).toLowerCase();
  const sourceName = path.basename(sourcePath, path.extname(sourcePath));
  const assetFile = assetFiles.find(
    (file) =>
      file.startsWith(`${sourceName}-`) &&
      path.extname(file).toLowerCase() === sourceExtension,
  );

  expect(assetFile).toBeDefined();
  await expect(
    readFile(path.join(assetDirectory, assetFile ?? '')),
  ).resolves.toEqual(await readFile(sourcePath));
  return assetFile ?? '';
}
