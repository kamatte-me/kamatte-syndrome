declare module 'virtual:react-optimized-responsive-image?*' {
  import type { ReactImageProps } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react';
  import type { ComponentType } from 'react';

  const ReactImage: ComponentType<ReactImageProps>;
  export default ReactImage;
}

declare module 'virtual:react-optimized-responsive-image/collection?*' {
  import type { ImageVariantManifest } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image';
  import type { ReactImageCollectionProps } from '@kamatte-syndrome/vite-plugin-react-optimized-responsive-image/react';
  import type { ComponentType } from 'react';

  export const manifest: ImageVariantManifest;
  const ReactImageCollection: ComponentType<ReactImageCollectionProps>;
  export default ReactImageCollection;
}
