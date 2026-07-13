import type {
  ContentImageEntry,
  ContentImageManifest,
  ContentImageVariant,
} from '@kamatte-syndrome/vite-plugin-content-images';
import type { ComponentPropsWithRef } from 'react';

type ContentImageBaseProps = Omit<
  ComponentPropsWithRef<'img'>,
  'alt' | 'children' | 'src'
> & {
  alt: string;
  /** Props applied when optimized sources render an outer picture element. */
  pictureProps?: Omit<ComponentPropsWithRef<'picture'>, 'children'>;
};

export type ContentImageProps = ContentImageBaseProps &
  (
    | {
        /** A single image imported from virtual:content-image. */
        image: ContentImageEntry;
        manifest?: never;
        src?: never;
      }
    | {
        image?: never;
        /** Build-time generated image variants used by this rendering context. */
        manifest: ContentImageManifest;
        src?: ComponentPropsWithRef<'img'>['src'];
      }
  );

export function ContentImage(props: ContentImageProps) {
  const {
    alt,
    height,
    image,
    manifest,
    sizes,
    src,
    srcSet,
    width,
    pictureProps,
    ...imageProps
  } = props;
  const entry =
    image ?? (typeof src === 'string' ? manifest?.[src] : undefined);
  const fallbackSrc = entry?.src ?? src;
  const avif = entry?.avif ?? [];
  const webp = entry?.webp ?? [];

  if (!entry || srcSet || (avif.length === 0 && webp.length === 0)) {
    return (
      <img
        {...imageProps}
        src={fallbackSrc}
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
        {...imageProps}
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
