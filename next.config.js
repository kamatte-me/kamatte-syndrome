const withPWA = require('next-pwa');

module.exports = withPWA({
  images: {
    domains: [
      'images.microcms-assets.io',
      'img.youtube.com',
      'qr-official.line.me',
      'scdn.line-apps.com',
    ],
  },
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
  },
});
