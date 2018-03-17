const contentfulConfig = require('./.contentful.json');

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
      { hid: 'og:image', property: 'og:image', content: 'https://kamatte.me/logo.png' },
      { hid: 'og:locale', property: 'og:locale', content: 'ja_JP' },
      { hid: 'fb:app_id', property: 'fb:app_id', content: '159097111464111' },
      { hid: 'twitter:card', property: 'twitter:card', content: 'summary' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
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
    GOOGLE_API_KEY: 'AIzaSyBk1V2ERjxr8SnO-VjNRBJSyHT9oUx55ek',
    CTF_SPACE_ID: contentfulConfig.CTF_SPACE_ID,
    CTF_CDA_ACCESS_TOKEN: contentfulConfig.CTF_CDA_ACCESS_TOKEN,
    CTF_BLOG_POST_TYPE_ID: contentfulConfig.CTF_BLOG_POST_TYPE_ID,
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
  buildDir: '../functions/nuxt',
  build: {
    publicPath: '/assets/',
    babel: {
      presets: [
        'es2015',
        'stage-0',
      ],
      plugins: [
        ['transform-runtime', {
          polyfill: true,
          regenerator: true,
        }],
      ],
    },
    postcss: {
      plugins: {
        'postcss-custom-properties': {
          warnings: false,
        },
      },
    },
    extractCSS: true,
    vendor: [
      'buefy',
      'axios',
      'moment',
      'lodash',
      'vue-markdown',
      'contentful',
      '~/plugins/buefy',
      '~/plugins/contentful',
    ],
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
    '@nuxtjs/component-cache',
    ['@nuxtjs/google-analytics', {
      id: 'UA-8322636-7',
    }],
    '@nuxtjs/pwa',
  ],
  manifest: {
    name: 'kamatte syndrome',
    lang: 'ja',
  },
};
