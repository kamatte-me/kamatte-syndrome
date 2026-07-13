declare module 'virtual:content-images?*' {
  import type { ContentImageManifest } from '@kamatte-syndrome/vite-plugin-content-images';

  export const contentImageManifest: ContentImageManifest;
  export default contentImageManifest;
}

declare module 'virtual:content-image?*' {
  import type { ContentImageEntry } from '@kamatte-syndrome/vite-plugin-content-images';

  export const contentImage: ContentImageEntry;
  export default contentImage;
}
