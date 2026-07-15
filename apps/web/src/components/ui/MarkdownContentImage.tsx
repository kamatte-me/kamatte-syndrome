import ContentImage from 'virtual:react-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;480;640;960';
import type { ComponentPropsWithoutRef } from 'react';

export type MarkdownContentImageProps = ComponentPropsWithoutRef<'img'>;

export function MarkdownContentImage({
  alt,
  loading,
  sizes,
  src,
  ...props
}: MarkdownContentImageProps) {
  const resolvedAlt = alt ?? '';
  const resolvedLoading = loading ?? 'lazy';
  const resolvedSizes = sizes ?? '(max-width: 528px) calc(100vw - 3rem), 480px';

  if (typeof src !== 'string') {
    return (
      <img
        {...props}
        src={src}
        alt={resolvedAlt}
        loading={resolvedLoading}
        sizes={resolvedSizes}
      />
    );
  }

  return (
    <ContentImage
      {...props}
      src={src}
      alt={resolvedAlt}
      loading={resolvedLoading}
      sizes={resolvedSizes}
    />
  );
}
