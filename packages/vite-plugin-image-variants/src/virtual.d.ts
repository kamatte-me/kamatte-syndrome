declare module 'virtual:image-variants?*' {
  import type { ImageVariantManifest } from '@kamatte-syndrome/vite-plugin-image-variants';

  export const imageVariantManifest: ImageVariantManifest;
  export default imageVariantManifest;
}

declare module 'virtual:image-variant?*' {
  import type { ImageVariantEntry } from '@kamatte-syndrome/vite-plugin-image-variants';

  export const imageVariant: ImageVariantEntry;
  export default imageVariant;
}
