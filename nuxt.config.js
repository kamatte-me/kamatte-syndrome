const contentful = require('contentful');
const apiKeys = require('./.apikeys.json');

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - kamatte syndrome',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'plz kamatte me!!!' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'kamatte syndrome' },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:image', property: 'og:image', content: 'https://kamatte.me/apple-touch-icon.png' },
      { hid: 'og:locale', property: 'og:locale', content: 'ja_JP' },
      { hid: 'fb:app_id', property: 'fb:app_id', content: '159097111464111' },
      { hid: 'twitter:card', property: 'twitter:card', content: 'summary' },
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Josefin+Sans:300,400' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.0.8/css/all.css' },
    ],
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#00c69c' },
  /*
  ** Environment variables
  */
  env: {
    YOUTUBE_API_KEY: apiKeys.YOUTUBE_API_KEY,
    CTF_SPACE_ID: apiKeys.CTF_SPACE_ID,
    CTF_CDA_ACCESS_TOKEN: apiKeys.CTF_CDA_ACCESS_TOKEN,
    CTF_BLOG_POST_TYPE_ID: apiKeys.CTF_BLOG_POST_TYPE_ID,
  },
  /**
   * CSS
   */
  css: [
    'buefy',
    '@/assets/css/main.scss',
  ],
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      plugins: {
        'postcss-custom-properties': {
          warnings: false,
        },
      },
    },
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        });
      }
    },
  },
  plugins: [
    '~/plugins/buefy',
    '~/plugins/contentful',
  ],
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/component-cache',
    ['@nuxtjs/google-analytics', {
      id: apiKeys.GA_TRACKING_ID,
    }],
    ['@nuxtjs/google-adsense', {
      id: 'ca-pub-6468254257303340',
      pageLevelAds: true,
    }],
    '@nuxtjs/pwa',
    '@nuxtjs/sitemap',
  ],
  manifest: {
    name: 'kamatte syndrome',
    lang: 'ja',
  },
  sitemap: {
    hostname: 'https://kamatte.me',
    cacheTime: 1000 * 60 * 15,
    routes() {
      const client = contentful.createClient({
        space: apiKeys.CTF_SPACE_ID,
        accessToken: apiKeys.CTF_CDA_ACCESS_TOKEN,
      });
      return client.getEntries({
        content_type: apiKeys.CTF_BLOG_POST_TYPE_ID,
        order: '-sys.createdAt',
        limit: 1000,
      }).then(entries => entries.items.map(entry => `/blog/${entry.fields.slug}`));
    },
  },
};
