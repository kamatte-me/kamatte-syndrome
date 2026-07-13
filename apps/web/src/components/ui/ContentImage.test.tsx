import type {
  ContentImageEntry,
  ContentImageManifest,
} from '@kamatte-syndrome/vite-plugin-content-images';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContentImage } from './ContentImage';

const manifest = {
  '/media/example.jpg': {
    avif: [
      { src: '/media/_optimized/example.jpg.hash.320w.avif', width: 320 },
      { src: '/media/_optimized/example.jpg.hash.640w.avif', width: 640 },
    ],
    height: 600,
    src: '/media/example.jpg',
    webp: [{ src: '/media/_optimized/example.jpg.hash.320w.webp', width: 320 }],
    width: 800,
  },
} satisfies ContentImageManifest;

describe('ContentImage', () => {
  it('renders responsive picture sources for a generated content image', () => {
    const { container } = render(
      <ContentImage
        src="/media/example.jpg"
        alt="Example"
        manifest={manifest}
        pictureProps={{ className: 'responsive-picture' }}
        sizes="480px"
        loading="lazy"
      />,
    );

    const image = screen.getByRole('img', { name: 'Example' });
    const sources = container.querySelectorAll('source');

    expect(image).toHaveAttribute('src', '/media/example.jpg');
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '600');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('picture')).toHaveClass(
      'responsive-picture',
    );
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[0]).toHaveAttribute(
      'srcset',
      '/media/_optimized/example.jpg.hash.320w.avif 320w, /media/_optimized/example.jpg.hash.640w.avif 640w',
    );
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
    expect(sources[1]).toHaveAttribute('sizes', '480px');
  });

  it('preserves explicit dimensions and source sets', () => {
    const { container } = render(
      <ContentImage
        src="/media/example.jpg"
        srcSet="/custom.jpg 2x"
        alt="Custom"
        manifest={manifest}
        width={120}
        height={120}
      />,
    );

    expect(container.querySelector('picture')).toBeNull();
    expect(screen.getByRole('img', { name: 'Custom' })).toHaveAttribute(
      'srcset',
      '/custom.jpg 2x',
    );
    expect(screen.getByRole('img', { name: 'Custom' })).toHaveAttribute(
      'width',
      '120',
    );
  });

  it('uses only the variants supplied by the rendering context manifest', () => {
    const compactManifest = {
      '/media/example.jpg': {
        ...manifest['/media/example.jpg'],
        avif: [manifest['/media/example.jpg'].avif[0]],
        webp: [manifest['/media/example.jpg'].webp[0]],
      },
    } satisfies ContentImageManifest;
    const { container } = render(
      <ContentImage
        src="/media/example.jpg"
        alt="Sized"
        manifest={compactManifest}
        sizes="320px"
      />,
    );

    expect(
      container.querySelector('source[type="image/avif"]'),
    ).toHaveAttribute(
      'srcset',
      '/media/_optimized/example.jpg.hash.320w.avif 320w',
    );
    expect(
      container.querySelector('source[type="image/webp"]'),
    ).toHaveAttribute(
      'srcset',
      '/media/_optimized/example.jpg.hash.320w.webp 320w',
    );
  });

  it('renders a directly imported content image', () => {
    const image = manifest['/media/example.jpg'] satisfies ContentImageEntry;
    const { container } = render(
      <ContentImage
        image={image}
        alt="Direct"
        sizes="120px"
        width={120}
        height={90}
      />,
    );

    expect(container.querySelector('picture')).not.toBeNull();
    expect(screen.getByRole('img', { name: 'Direct' })).toHaveAttribute(
      'src',
      '/media/example.jpg',
    );
    expect(screen.getByRole('img', { name: 'Direct' })).toHaveAttribute(
      'width',
      '120',
    );
    expect(
      container.querySelector('source[type="image/avif"]'),
    ).toHaveAttribute('sizes', '120px');
  });

  it('uses the direct image fallback when variants are empty', () => {
    const image = {
      ...manifest['/media/example.jpg'],
      avif: [],
      webp: [],
    } satisfies ContentImageEntry;
    const { container } = render(<ContentImage image={image} alt="Fallback" />);

    expect(container.querySelector('picture')).toBeNull();
    expect(screen.getByRole('img', { name: 'Fallback' })).toHaveAttribute(
      'src',
      '/media/example.jpg',
    );
  });

  it('falls back to a normal image for unknown and external URLs', () => {
    const { container } = render(
      <ContentImage
        src="https://example.com/image.jpg"
        alt="Remote"
        manifest={manifest}
      />,
    );

    expect(container.querySelector('picture')).toBeNull();
    expect(screen.getByRole('img', { name: 'Remote' })).toHaveAttribute(
      'src',
      'https://example.com/image.jpg',
    );
  });
});
