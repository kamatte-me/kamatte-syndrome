/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: [
      'images.microcms-assets.io',
      'img.youtube.com',
      'qr-official.line.me',
      'scdn.line-apps.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
};
