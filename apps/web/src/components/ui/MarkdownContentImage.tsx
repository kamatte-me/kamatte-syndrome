import ContentImage from 'virtual:react-image/collection?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;480;640;960';
import type { ComponentPropsWithoutRef } from 'react';

export type MarkdownContentImageProps = ComponentPropsWithoutRef<'img'>;

export function MarkdownContentImage({
  alt,
  loading,
  sizes,
  ...props
}: MarkdownContentImageProps) {
  return (
    <ContentImage
      {...props}
      alt={alt ?? ''}
      loading={loading ?? 'lazy'}
      sizes={sizes ?? '(max-width: 528px) calc(100vw - 3rem), 480px'}
    />
  );
}
