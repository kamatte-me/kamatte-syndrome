import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'images.microcms-assets.io',
      },
      {
        hostname: 'img.youtube.com',
      },
      {
        hostname: 'qr-official.line.me',
      },
      {
        hostname: 'scdn.line-apps.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
  typedRoutes: true,
};

export default config;
