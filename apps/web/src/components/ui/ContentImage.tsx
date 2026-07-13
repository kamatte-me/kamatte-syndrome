import type {
  ContentImageManifest,
  ContentImageVariant,
} from '@kamatte-syndrome/vite-plugin-content-images';
import type { ComponentPropsWithRef } from 'react';

export type ContentImageProps = Omit<
  ComponentPropsWithRef<'img'>,
  'alt' | 'children'
> & {
  alt: string;
  /** Build-time generated image variants used by this rendering context. */
  manifest: ContentImageManifest;
  /** Props applied when optimized sources render an outer picture element. */
  pictureProps?: Omit<ComponentPropsWithRef<'picture'>, 'children'>;
};

export function ContentImage({
  alt,
  height,
  sizes,
  src,
  srcSet,
  width,
  manifest,
  pictureProps,
  ...props
}: ContentImageProps) {
  const entry = typeof src === 'string' ? manifest[src] : undefined;
  const avif = entry?.avif ?? [];
  const webp = entry?.webp ?? [];

  if (!entry || srcSet || (avif.length === 0 && webp.length === 0)) {
    return (
      <img
        {...props}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width ?? entry?.width}
        height={height ?? entry?.height}
        alt={alt}
      />
    );
  }

  return (
    <picture {...pictureProps}>
      {avif.length > 0 ? (
        <source type="image/avif" srcSet={createSrcSet(avif)} sizes={sizes} />
      ) : null}
      {webp.length > 0 ? (
        <source type="image/webp" srcSet={createSrcSet(webp)} sizes={sizes} />
      ) : null}
      <img
        {...props}
        src={entry.src}
        sizes={sizes}
        width={width ?? entry.width}
        height={height ?? entry.height}
        alt={alt}
      />
    </picture>
  );
}

function createSrcSet(variants: readonly ContentImageVariant[]) {
  return variants.map(({ src, width }) => `${src} ${width}w`).join(', ');
}
