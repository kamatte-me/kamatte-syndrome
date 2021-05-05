const contentful = require('contentful');
require('dotenv').config();

module.exports = {
  mode: 'universal',

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
  env: {
    API_HOST: process.env.NODE_ENV === 'production' ?
      'https://asia-northeast1-kamatte-syndrome-215913.cloudfunctions.net/api' : 'http://localhost:5000',
    GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
    GCP_API_KEY: process.env.GCP_API_KEY,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    MESSAGING_SENDER_ID: process.env.MESSAGING_SENDER_ID,
    CTF_CDA_ACCESS_TOKEN: process.env.CTF_CDA_ACCESS_TOKEN,
    CTF_SPACE_ID: 'ky376v5x3o44',
    CTF_BLOG_POST_TYPE_ID: 'post',
  },
  /**
   * CSS
   */
  css: [
    '@/assets/css/main.scss',
  ],
  /*
  ** Build configuration
  */
  build: {
    extractCSS: true,
    filenames: {
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : '[path][name].[hash:7].[ext]',
      video: ({ isDev }) => isDev ? '[path][name].[ext]' : '[path][name].[hash:7].[ext]',
    },
    /*
    ** Run ESLint on save
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },
  plugins: [
    '~/plugins/contentful',
    { src: '~/plugins/firebase', ssr: false }
  ],
  modules: [
    ['nuxt-buefy', { css: false }],
    '@nuxtjs/axios',
    '@nuxtjs/component-cache',
    '@nuxtjs/dotenv',
    ['@nuxtjs/google-analytics', {
      id: 'UA-8322636-7',
    }],
    '@nuxtjs/pwa',
    '@nuxtjs/sitemap',
    'nuxt-client-init-module',
  ],
  manifest: {
    name: 'kamatte syndrome',
    short_name: 'kamatte syndrome',
    lang: 'ja',
    gcm_sender_id: "103953800507",
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: 'https://cdn.materialdesignicons.com/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://fonts.gstatic.com/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://fonts.googleapis.com/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://images.ctfassets.net/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://cdn.contentful.com/*',
        handler: 'networkFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://www.googleapis.com/youtube/v3/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
      {
        urlPattern: 'https://i.ytimg.com/*',
        handler: 'cacheFirst',
        method: 'GET',
      },
    ],
  },
  sitemap: {
    async routes() {
      const client = contentful.createClient({
        space: 'ky376v5x3o44',
        accessToken: process.env.CTF_CDA_ACCESS_TOKEN,
      });

      const allRoutes = [];
      let totalEntries;
      let count = 1;
      const limit = 1000;
      do {
        const entries = await client.getEntries({
          content_type: 'post',
          order: '-sys.createdAt',
          skip: (count - 1) * limit,
          limit,
        });
        const routes = entries.items.map(entry => `/blog/${entry.fields.slug}`);
        Array.prototype.push.apply(allRoutes, routes);

        totalEntries = entries.total;
        count += 1;
      } while (allRoutes.length < totalEntries);

      return allRoutes;
    },
  },
};