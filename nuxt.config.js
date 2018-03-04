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
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#00c69c' },
  /*
  ** Environment variables
  */
  env: {
    googleApiKey: 'AIzaSyBk1V2ERjxr8SnO-VjNRBJSyHT9oUx55ek',
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
  },
  vendor: [
    'vue',
    'vuex',
    'buefy',
    'axios',
    '@nuxtjs/component-cache',
    'lodash',
    'graphql-tag',
  ],
  plugins: [
    '~/plugins/buefy',
  ],
  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/component-cache',
    ['@nuxtjs/google-analytics', {
      id: 'UA-8322636-7',
    }],
  ],
  css: [
    'buefy',
    '@/assets/css/main.scss',
  ],
  apollo: {
    clientConfigs: {
      default: '~/apollo/client-configs/default.js',
    },
  },
};
