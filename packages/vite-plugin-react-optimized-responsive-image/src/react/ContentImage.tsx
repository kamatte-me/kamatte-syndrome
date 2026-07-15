import type { ComponentPropsWithRef } from 'react';
import type {
  ImageVariant,
  ImageVariantEntry,
  ImageVariantManifest,
} from '../types.ts';

export type ContentImageBaseProps = Omit<
  ComponentPropsWithRef<'img'>,
  'alt' | 'children' | 'src'
> & {
  alt: string;
  /** Props applied when optimized sources render an outer picture element. */
  pictureProps?: Omit<ComponentPropsWithRef<'picture'>, 'children'>;
};

export type ReactImageProps = ContentImageBaseProps;

export type ReactImageCollectionProps = ContentImageBaseProps & {
  src: string;
};

export type ContentImageProps =
  | (ReactImageProps & {
      /** A single image variant bound by virtual:react-optimized-responsive-image. */
      image: ImageVariantEntry;
      manifest?: never;
      src?: never;
    })
  | (ReactImageCollectionProps & {
      image?: never;
      /** Build-time generated image variants used by this rendering context. */
      manifest: ImageVariantManifest;
    });

export function createReactImage(image: ImageVariantEntry) {
  return function ReactImage(props: ReactImageProps) {
    return <ContentImage {...props} image={image} />;
  };
}

export function createReactImageCollection(manifest: ImageVariantManifest) {
  return function ReactImageCollection(props: ReactImageCollectionProps) {
    return <ContentImage {...props} manifest={manifest} />;
  };
}

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
  const dimensions = resolveDimensions({ entry, height, width });

  if (
    !entry ||
    srcSet !== undefined ||
    (avif.length === 0 && webp.length === 0)
  ) {
    return (
      <img
        {...imageProps}
        src={fallbackSrc}
        srcSet={srcSet}
        sizes={sizes}
        width={dimensions.width}
        height={dimensions.height}
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
        width={dimensions.width}
        height={dimensions.height}
        alt={alt}
      />
    </picture>
  );
}

function createSrcSet(variants: readonly ImageVariant[]) {
  return variants.map(({ src, width }) => `${src} ${width}w`).join(', ');
}

type ImageDimension = ComponentPropsWithRef<'img'>['width'];

function resolveDimensions({
  entry,
  height,
  width,
}: Readonly<{
  entry: ImageVariantEntry | undefined;
  height: ImageDimension;
  width: ImageDimension;
}>) {
  if (!entry || (width !== undefined && height !== undefined)) {
    return { height, width };
  }

  if (width === undefined && height === undefined) {
    return { height: entry.height, width: entry.width };
  }

  if (width !== undefined) {
    return {
      height: scaleDimension(width, entry.height / entry.width),
      width,
    };
  }

  return {
    height,
    width: scaleDimension(height, entry.width / entry.height),
  };
}

function scaleDimension(value: ImageDimension, ratio: number) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.round(numericValue * ratio)
    : undefined;
}
