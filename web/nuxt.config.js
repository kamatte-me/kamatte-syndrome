const contentful = require('contentful');
require('dotenv').config();

const env = {
  API_HOST: process.env.NODE_ENV === 'production' ?
      'https://asia-northeast1-kamatte-syndrome-215913.cloudfunctions.net/api' : 'http://localhost:5000',
  GCP_API_KEY: process.env.GCP_API_KEY,
  MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
  CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN,
  CTF_SPACE_ID: 'ky376v5x3o44',
  CTF_BLOG_POST_TYPE_ID: '2wKn6yEnZewu2SCCkus4as',
  GA_TRACKING_ID: 'UA-8322636-7',
};

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
      { hid: 'og:image', property: 'og:image', content: 'https://kamatte.me/icon.png' },
      { hid: 'og:locale', property: 'og:locale', content: 'ja_JP' },
      { hid: 'fb:app_id', property: 'fb:app_id', content: '159097111464111' },
      { hid: 'twitter:card', property: 'twitter:card', content: 'summary' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Josefin+Sans:300,400' },
    ],
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#00c69c' },
  /*
  ** Environment variables
  */
  env,
  /**
   * CSS
   */
  css: [
    '@/assets/css/main.scss',
  ],
  /*
  ** Router configuration
  */
  router: {
    // 異なるLayout間を遷移した時にスクロール位置が保持されるIssueを解消
    // https://github.com/nuxt/nuxt.js/issues/2738
    // TODO: Issue Close後に削除
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        let position = {};
        if (to.matched.length < 2) {
          position = { x: 0, y: 0 }
        } else if (to.matched.some(r => r.components.default.options.scrollToTop)) {
          position = { x: 0, y: 0 }
        }
        if (to.hash) {
          position = { selector: to.hash }
        }
        return position
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      'axios'
    ],
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
    '~/plugins/contentful',
  ],
  modules: [
    ['nuxt-buefy', { css: false }],
    '@nuxtjs/component-cache',
    '@nuxtjs/dotenv',
    ['@nuxtjs/google-analytics', {
      id: env.GA_TRACKING_ID,
    }],
    '@nuxtjs/pwa',
    '@nuxtjs/sitemap',
  ],
  manifest: {
    name: 'kamatte syndrome',
    short_name: 'kamatte syndrome',
    lang: 'ja',
    gcm_sender_id: "103953800507",
  },
  workbox: {
    dev: true,
    runtimeCaching: [
      {
        urlPattern: '(http|https)://images.ctfassets.net/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: '(http|https)://cdn.contentful.com/*',
        handler: 'networkFirst',
        method: 'GET',
      },
      {
        urlPattern: '(http|https)://www.googleapis.com/youtube/v3/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: '(http|https)://i.ytimg.com/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
    ],
  },
  sitemap: {
    hostname: 'https://kamatte.me',
    cacheTime: 1000 * 60 * 15,
    routes() {
      const client = contentful.createClient({
        space: env.CTF_SPACE_ID,
        accessToken: env.CTF_CDA_ACCESS_TOKEN,
      });
      return client.getEntries({
        content_type: env.CTF_BLOG_POST_TYPE_ID,
        order: '-sys.createdAt',
        limit: 1000,
      }).then(entries => entries.items.map(entry => `/blog/${entry.fields.slug}`));
    },
  },
};
