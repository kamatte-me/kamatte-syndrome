const contentful = require('contentful');
const apiKeys = require('./.apikeys.json');

module.exports = {
  dev: false,
  buildDir: 'nuxt',
  build: {
    publicPath: '/assets/',
  },
  modules: [
    '@nuxtjs/component-cache',
    '@nuxtjs/sitemap',
  ],
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
