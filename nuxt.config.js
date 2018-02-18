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
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Josefin+Sans:100' },
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
  loading: { color: '#3B8070' },
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
  },
  vendor: [
    'vue',
    'vuex',
    'buefy',
    '@nuxtjs/component-cache',
  ],
  plugins: [
    '~/plugins/buefy',
  ],
  css: [
    'buefy',
    '@/assets/css/main.scss',
    '@/assets/css/index.scss',
  ],
};
