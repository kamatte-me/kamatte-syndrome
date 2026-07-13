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
import { contentImages } from './index.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('contentImages', () => {
  it('shares read-only image metadata across build environments', () => {
    const [plugin] = contentImages({
      cacheDirectory: '/cache',
      enabled: false,
    });

    expect(plugin?.sharedDuringBuild).toBe(true);
  });

  it('keeps dev image watchers active until the server closes', async () => {
    const cacheDirectory = await createRootDirectory('content-images-cache-');
    const [plugin] = contentImages({ cacheDirectory });
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
      await createRootDirectory('content-images-root-'),
    );
    const realSourceDirectory = await realpath(
      await createRootDirectory('content-images-source-'),
    );
    const sourceDirectory = path.join(rootDirectory, 'content-media');
    const imagePath = path.join(realSourceDirectory, 'image.png');
    await symlink(realSourceDirectory, sourceDirectory, 'dir');
    await writeTestPng(imagePath, 'red');
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      "import 'virtual:content-images?src=/content-media&base=/media&widths=40';\n",
    );

    const server = await createServer({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        contentImages({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      root: rootDirectory,
      server: {
        fs: { allow: [rootDirectory, realSourceDirectory] },
        middlewareMode: true,
      },
    });

    try {
      await server.transformRequest('/main.js');
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
    const rootDirectory = await createRootDirectory('content-images-vite-');
    const contentSourceDirectory = path.join(rootDirectory, 'content-media');
    const assetSourceDirectory = path.join(rootDirectory, 'src/assets/images');
    const outputDirectory = path.join(rootDirectory, 'dist');
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
        "import contentImages from 'virtual:content-images?src=@@/content-media&base=/media&widths=100;160';",
        "import assetImages from 'virtual:content-images?src=./src/assets/images&base=/app-images&widths=24;48';",
        'console.log(contentImages, assetImages);',
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
        contentImages({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      publicDir: false,
      resolve: {
        alias: [{ find: /^@@\//, replacement: `${rootDirectory}/` }],
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

    const bundleFile = assetFiles.find((file) => file.endsWith('.js'));
    expect(bundleFile).toBeDefined();
    const bundle = await readFile(
      path.join(assetDirectory, bundleFile ?? ''),
      'utf8',
    );
    expect(bundle).toContain('/media/photo.JPG');
    expect(bundle).toContain('/media/oriented.jpg');
    expect(bundle).toContain('/app-images/hoge.jpg');
    expect(bundle).toContain('width:24');
    expect(bundle).toContain('width:48');
    expect(bundle).toContain('width:160');
    expect(bundle).toContain('width:120');
    await expect(
      access(path.join(outputDirectory, 'media/photo.JPG')),
    ).rejects.toThrow();
  });

  it('builds an importer-relative single image', async () => {
    const rootDirectory = await createRootDirectory('content-image-vite-');
    const sourceDirectory = path.join(rootDirectory, 'src');
    const outputDirectory = path.join(rootDirectory, 'dist');
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
      .toFile(path.join(sourceDirectory, 'image.jpg'));
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      [
        "import image from 'virtual:content-image?src=./src/image.jpg&widths=40;100;160';",
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
        contentImages({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
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
      sharp(path.join(assetDirectory, fallbackFile ?? '')).metadata(),
    ).resolves.toMatchObject({ height: 80, width: 120 });

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

  it('rejects a collection source that is not a directory', async () => {
    const rootDirectory = await createRootDirectory('content-images-error-');
    await writeFile(
      path.join(rootDirectory, 'main.js'),
      "import 'virtual:content-images?src=/missing&base=/media&widths=320';\n",
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
          contentImages({
            cacheDirectory: path.join(rootDirectory, 'cache'),
          }),
        ],
        publicDir: false,
        root: rootDirectory,
      }),
    ).rejects.toThrow('Unable to read content image directory: /missing');
  });
});

async function createRootDirectory(prefix: string) {
  const rootDirectory = await mkdtemp(path.join(tmpdir(), prefix));
  temporaryDirectories.push(rootDirectory);
  return rootDirectory;
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
