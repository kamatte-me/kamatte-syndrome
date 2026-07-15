declare module 'virtual:react-image?*' {
  import type { ImageVariantEntry } from '@kamatte-syndrome/vite-plugin-image-variants';
  import type { ReactImageProps } from '@kamatte-syndrome/vite-plugin-image-variants/react';
  import type { ComponentType } from 'react';

  export const variant: ImageVariantEntry;

  const ReactImage: ComponentType<ReactImageProps>;
  export default ReactImage;
}

declare module 'virtual:react-image/collection?*' {
  import type { ImageVariantManifest } from '@kamatte-syndrome/vite-plugin-image-variants';
  import type { ReactImageCollectionProps } from '@kamatte-syndrome/vite-plugin-image-variants/react';
  import type { ComponentType } from 'react';

  export const manifest: ImageVariantManifest;

  const ReactImageCollection: ComponentType<ReactImageCollectionProps>;
  export default ReactImageCollection;
}
