const contentfulConfig = require('./.contentful.json');

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'kamatte syndrome',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'plz kamatte me!!!' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Josefin+Sans:300,400' },
      { rel: 'stylesheet', href: '//cdn.materialdesignicons.com/2.0.46/css/materialdesignicons.min.css' },
    ],
    htmlAttrs: {
      class: 'has-navbar-fixed-top',
    },
  },
  render: {
    static: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  },
  cache: true,
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
  /*
  ** Build configuration
  */
  build: {
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
    postcss: {
      plugins: {
        'postcss-custom-properties': {
          warnings: false,
        },
      },
    },
    vendor: [
      '@nuxtjs/component-cache',
      '@nuxtjs/google-analytics',
      'buefy',
      'axios',
      'moment',
      'lodash',
      'vue-markdown',
      'contentful',
      '~/plugins/buefy',
      '~/plugins/contentful',
    ],
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
  ],
  css: [
    'buefy',
    '@/assets/css/main.scss',
  ],
};
