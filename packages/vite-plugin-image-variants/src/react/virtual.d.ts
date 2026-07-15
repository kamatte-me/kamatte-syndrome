declare module 'virtual:react-image?*' {
  import type { ReactImageProps } from '@kamatte-syndrome/vite-plugin-image-variants/react';
  import type { ComponentType } from 'react';

  const ReactImage: ComponentType<ReactImageProps>;
  export default ReactImage;
}

declare module 'virtual:react-image/collection?*' {
  import type { ReactImageCollectionProps } from '@kamatte-syndrome/vite-plugin-image-variants/react';
  import type { ComponentType } from 'react';

  const ReactImageCollection: ComponentType<ReactImageCollectionProps>;
  export default ReactImageCollection;
}
