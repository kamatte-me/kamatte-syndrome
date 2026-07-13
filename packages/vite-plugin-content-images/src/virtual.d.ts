declare module 'virtual:content-images?*' {
  import type { ContentImageManifest } from '@kamatte-syndrome/vite-plugin-content-images';

  export const contentImageManifest: ContentImageManifest;
  export default contentImageManifest;
}
