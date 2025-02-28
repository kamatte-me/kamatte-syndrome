// @ts-check
/** @type {import('next').NextConfig} */
const config = {
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
};

module.exports = config;
