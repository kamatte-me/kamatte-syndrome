import markdownImageVariants from 'virtual:image-variants?src=@@/kamatte-syndrome-content/media&base=/media&widths=320;480;640;960';
import type { ComponentPropsWithoutRef } from 'react';
import { ContentImage } from './ContentImage';

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
      manifest={markdownImageVariants}
      sizes={sizes ?? '(max-width: 528px) calc(100vw - 3rem), 480px'}
    />
  );
}
