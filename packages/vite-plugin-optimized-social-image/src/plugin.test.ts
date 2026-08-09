import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { build, createServer } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { optimizedSocialImage } from './index.ts';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('optimizedSocialImage', () => {
  it('processes every vite-imagetools source extension', async () => {
    const rootDirectory = await createRootDirectory();
    const imageDirectory = path.join(rootDirectory, 'images');
    await mkdir(imageDirectory, { recursive: true });
    await writeSupportedSourceFixtures(imageDirectory);
    await writeCollectionImport(rootDirectory);

    const server = await createServer({
      configFile: false,
      logLevel: 'silent',
      plugins: [optimizedSocialImage()],
      root: rootDirectory,
      server: { middlewareMode: true },
    });

    try {
      const module = await server.ssrLoadModule('/main.ts');
      const manifest = module.manifest as Record<
        string,
        { format: string } | undefined
      >;

      expect(manifest).toMatchObject({
        '/media/format-avif.avif': { format: 'jpeg' },
        '/media/format-gif.gif': { format: 'gif' },
        '/media/format-heif.heif': { format: 'jpeg' },
        '/media/format-jpeg.jpeg': { format: 'jpeg' },
        '/media/format-jpg.jpg': { format: 'jpeg' },
        '/media/format-png.png': { format: 'jpeg' },
        '/media/format-tiff.tiff': { format: 'jpeg' },
        '/media/format-webp.webp': { format: 'jpeg' },
      });
    } finally {
      await server.close();
    }
  });

  it('emits one compatible social image per source without omitting larger results', async () => {
    const rootDirectory = await createRootDirectory();
    const imageDirectory = path.join(rootDirectory, 'images');
    const outputDirectory = path.join(rootDirectory, 'dist');
    await mkdir(imageDirectory, { recursive: true });
    await writeImageFixtures(imageDirectory);
    await writeCollectionImport(rootDirectory);

    await build({
      build: {
        assetsInlineLimit: 0,
        outDir: outputDirectory,
        rollupOptions: { input: path.join(rootDirectory, 'main.ts') },
      },
      configFile: false,
      logLevel: 'silent',
      plugins: [
        optimizedSocialImage({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      publicDir: false,
      root: rootDirectory,
    });

    const assetDirectory = path.join(outputDirectory, 'assets');
    const assets = await readdir(assetDirectory);
    expect(assets).toContainEqual(
      expect.stringMatching(/^opaque\.1200x600\.[a-f0-9]{8}\.jpeg$/),
    );
    expect(assets).toContainEqual(
      expect.stringMatching(/^transparent\.1200x600\.[a-f0-9]{8}\.png$/),
    );
    expect(assets).toContainEqual(
      expect.stringMatching(/^animated\.1200x600\.[a-f0-9]{8}\.gif$/),
    );
    expect(assets).toContainEqual(
      expect.stringMatching(/^animated-webp\.1200x600\.[a-f0-9]{8}\.jpeg$/),
    );
    expect(assets).toContainEqual(
      expect.stringMatching(/^tiny\.[a-f0-9]{8}\.jpeg$/),
    );
    const transparentAsset = assets.find((asset) =>
      asset.startsWith('transparent.'),
    );
    expect(transparentAsset).toBeDefined();
    await expect(
      sharp(path.join(assetDirectory, transparentAsset ?? '')).metadata(),
    ).resolves.toMatchObject({ format: 'png', hasAlpha: true });

    const animatedAsset = assets.find((asset) => asset.startsWith('animated.'));
    expect(animatedAsset).toBeDefined();
    await expect(
      sharp(path.join(assetDirectory, animatedAsset ?? ''), { animated: true })
        .metadata()
        .then((metadata) => ({
          height: metadata.pageHeight,
          pages: metadata.pages,
          width: metadata.width,
        })),
    ).resolves.toEqual({ height: 600, pages: 2, width: 1200 });

    const animatedWebpAsset = assets.find((asset) =>
      asset.startsWith('animated-webp.'),
    );
    expect(animatedWebpAsset).toBeDefined();
    await expect(
      sharp(path.join(assetDirectory, animatedWebpAsset ?? ''))
        .metadata()
        .then((metadata) => ({
          format: metadata.format,
          height: metadata.height,
          pages: metadata.pages ?? 1,
          width: metadata.width,
        })),
    ).resolves.toEqual({ format: 'jpeg', height: 600, pages: 1, width: 1200 });

    await expect(
      Promise.all([
        stat(path.join(imageDirectory, 'tiny.webp')),
        stat(
          path.join(
            assetDirectory,
            assets.find((asset) => asset.startsWith('tiny.')) ?? '',
          ),
        ),
      ]),
    ).resolves.toSatisfy(([source, output]) => output.size > source.size);
  });

  it('serves generated social images from the Vite dev endpoint', async () => {
    const rootDirectory = await createRootDirectory();
    const imageDirectory = path.join(rootDirectory, 'images');
    await mkdir(imageDirectory, { recursive: true });
    await sharp({
      create: {
        background: { b: 80, g: 120, r: 160 },
        channels: 3,
        height: 600,
        width: 1600,
      },
    })
      .jpeg()
      .toFile(path.join(imageDirectory, 'opaque.jpg'));
    await writeCollectionImport(rootDirectory);

    const server = await createServer({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        optimizedSocialImage({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      root: rootDirectory,
      server: { port: 0 },
    });

    try {
      await server.listen();
      const module = await server.ssrLoadModule('/main.ts');
      const image = module.manifest['/media/opaque.jpg'];
      expect(image).toMatchObject({
        format: 'jpeg',
        height: 450,
        width: 1200,
      });
      const origin = server.resolvedUrls?.local[0];
      expect(origin).toBeDefined();
      const response = await fetch(new URL(image?.src ?? '', origin).href);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/jpeg');
    } finally {
      await server.close();
    }
  });

  it('renders directly emitted assets for relative and full Vite bases', async () => {
    const rootDirectory = await createRootDirectory();
    const imageDirectory = path.join(rootDirectory, 'images');
    await mkdir(imageDirectory, { recursive: true });
    await writeSizedPng(path.join(imageDirectory, 'image.png'), 100, 50);
    await writeCollectionImport(rootDirectory, './images', true);

    for (const base of ['./', 'https://cdn.example.com/site/'] as const) {
      const outputDirectory = path.join(
        rootDirectory,
        base === './' ? 'relative-dist' : 'cdn-dist',
      );
      await build({
        base,
        build: {
          assetsInlineLimit: 0,
          outDir: outputDirectory,
          rollupOptions: {
            input: path.join(rootDirectory, 'main.ts'),
            output: { entryFileNames: 'nested/main.js' },
          },
        },
        configFile: false,
        logLevel: 'silent',
        plugins: [
          optimizedSocialImage({
            cacheDirectory: path.join(rootDirectory, 'cache'),
          }),
        ],
        publicDir: false,
        root: rootDirectory,
      });

      const assetDirectory = path.join(outputDirectory, 'assets');
      const imageAsset = (await readdir(assetDirectory)).find((asset) =>
        asset.startsWith('image.'),
      );
      expect(imageAsset).toBeDefined();
      const bundle = await readFile(
        path.join(outputDirectory, 'nested/main.js'),
        'utf8',
      );
      expect(bundle).not.toContain('__VITE_ASSET__');
      if (base === './') {
        expect(bundle).toContain(`../assets/${imageAsset}`);
        expect(bundle).toContain('import.meta.url');
      } else {
        expect(bundle).toContain(
          `https://cdn.example.com/site/assets/${imageAsset}`,
        );
      }
    }
  });

  it('invalidates development assets when a symlinked source changes', async () => {
    const rootDirectory = await realpath(await createRootDirectory());
    const realSourceDirectory = await realpath(await createRootDirectory());
    const sourceDirectory = path.join(rootDirectory, 'content-media');
    const imagePath = path.join(realSourceDirectory, 'image.png');
    await symlink(realSourceDirectory, sourceDirectory, 'dir');
    await writeSizedPng(imagePath, 100, 50);
    await writeCollectionImport(rootDirectory, '/content-media');

    const server = await createServer({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        optimizedSocialImage({
          cacheDirectory: path.join(rootDirectory, 'cache'),
        }),
      ],
      root: rootDirectory,
      server: {
        fs: { allow: [rootDirectory, realSourceDirectory] },
        port: 0,
      },
    });

    try {
      await server.listen();
      const initialModule = await server.ssrLoadModule('/main.ts');
      const initialImage = initialModule.manifest['/media/image.png'];
      expect(initialImage).toMatchObject({ height: 50, width: 100 });

      const changedPaths: string[] = [];
      server.watcher.on('change', (filePath) => changedPaths.push(filePath));
      await new Promise((resolve) => setTimeout(resolve, 100));
      await writeSizedPng(imagePath, 200, 70);

      await vi.waitFor(() => expect(changedPaths).toContain(imagePath), {
        interval: 25,
        timeout: 5_000,
      });

      let refreshedImage:
        | { height: number; src: string; width: number }
        | undefined;
      await vi.waitFor(
        async () => {
          const refreshedModule = await server.ssrLoadModule('/main.ts');
          refreshedImage = refreshedModule.manifest['/media/image.png'];
          expect(refreshedImage).toMatchObject({ height: 70, width: 200 });
        },
        { interval: 25, timeout: 5_000 },
      );
      expect(refreshedImage?.src).not.toBe(initialImage?.src);

      const origin = server.resolvedUrls?.local[0];
      expect(origin).toBeDefined();
      const response = await fetch(
        new URL(refreshedImage?.src ?? '', origin).href,
      );
      expect(response.status).toBe(200);
    } finally {
      await server.close();
    }
  }, 10_000);
});

async function createRootDirectory() {
  const directory = await mkdtemp(
    path.join(tmpdir(), 'optimized-social-image-'),
  );
  temporaryDirectories.push(directory);
  return directory;
}

async function writeCollectionImport(
  rootDirectory: string,
  source = './images',
  logManifest = false,
) {
  await writeFile(
    path.join(rootDirectory, 'main.ts'),
    [
      `import { manifest } from 'virtual:optimized-social-image/collection?src=${source}&base=/media&width=1200';`,
      ...(logManifest ? ['console.log(manifest);'] : []),
      'export { manifest };',
      '',
    ].join('\n'),
  );
}

async function writeImageFixtures(imageDirectory: string) {
  const opaque = sharp({
    create: {
      background: { b: 80, g: 120, r: 160 },
      channels: 3,
      height: 1200,
      width: 2400,
    },
  });
  const transparent = sharp({
    create: {
      background: { alpha: 0.4, b: 60, g: 120, r: 180 },
      channels: 4,
      height: 1200,
      width: 2400,
    },
  });
  const redFrame = await sharp({
    create: {
      background: { b: 0, g: 0, r: 255 },
      channels: 3,
      height: 1200,
      width: 2400,
    },
  })
    .png()
    .toBuffer();
  const blueFrame = await sharp({
    create: {
      background: { b: 255, g: 0, r: 0 },
      channels: 3,
      height: 1200,
      width: 2400,
    },
  })
    .png()
    .toBuffer();

  await Promise.all([
    opaque.jpeg().toFile(path.join(imageDirectory, 'opaque.jpg')),
    transparent.png().toFile(path.join(imageDirectory, 'transparent.png')),
    sharp([redFrame, blueFrame], { join: { animated: true } })
      .gif({ delay: [120, 120] })
      .toFile(path.join(imageDirectory, 'animated.gif')),
    sharp([redFrame, blueFrame], { join: { animated: true } })
      .webp({ delay: [120, 120] })
      .toFile(path.join(imageDirectory, 'animated-webp.webp')),
    sharp({
      create: {
        background: { b: 80, g: 120, r: 160 },
        channels: 3,
        height: 24,
        width: 32,
      },
    })
      .webp()
      .toFile(path.join(imageDirectory, 'tiny.webp')),
  ]);
}

async function writeSizedPng(filePath: string, width: number, height: number) {
  await sharp({
    create: {
      background: { b: 80, g: 120, r: 160 },
      channels: 3,
      height,
      width,
    },
  })
    .png()
    .toFile(filePath);
}

async function writeSupportedSourceFixtures(imageDirectory: string) {
  const image = sharp({
    create: {
      background: { b: 80, g: 120, r: 160 },
      channels: 3,
      height: 24,
      width: 32,
    },
  });
  const [avif, gif, jpeg, png, tiff, webp] = await Promise.all([
    image.clone().avif().toBuffer(),
    image.clone().gif().toBuffer(),
    image.clone().jpeg().toBuffer(),
    image.clone().png().toBuffer(),
    image.clone().tiff().toBuffer(),
    image.clone().webp().toBuffer(),
  ]);

  await Promise.all([
    writeFile(path.join(imageDirectory, 'format-avif.avif'), avif),
    writeFile(path.join(imageDirectory, 'format-gif.gif'), gif),
    writeFile(path.join(imageDirectory, 'format-heif.heif'), avif),
    writeFile(path.join(imageDirectory, 'format-jpeg.jpeg'), jpeg),
    writeFile(path.join(imageDirectory, 'format-jpg.jpg'), jpeg),
    writeFile(path.join(imageDirectory, 'format-png.png'), png),
    writeFile(path.join(imageDirectory, 'format-tiff.tiff'), tiff),
    writeFile(path.join(imageDirectory, 'format-webp.webp'), webp),
  ]);
}
