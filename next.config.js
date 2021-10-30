/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    domains: [
      'images.microcms-assets.io',
      'img.youtube.com',
      'qr-official.line.me',
      'scdn.line-apps.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
