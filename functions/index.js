const functions = require('firebase-functions');
const { Nuxt } = require('nuxt');
const express = require('express');
const contentful = require('contentful');
const contentfulConfig = require('./.contentful.json');

const app = express();

const config = {
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
        space: contentfulConfig.CTF_SPACE_ID,
        accessToken: contentfulConfig.CTF_CDA_ACCESS_TOKEN,
      });
      return client.getEntries({
        content_type: contentfulConfig.CTF_BLOG_POST_TYPE_ID,
        order: '-sys.createdAt',
        limit: 1000,
      }).then((entries) => {
        const routes = [
          '/biography',
          '/portfolio',
          '/illustration',
          '/culture',
          '/blog',
        ];
        const postRoutes = entries.items.map(entry => `/blog/${entry.fields.slug}`);
        Array.prototype.push.apply(routes, postRoutes);
        return routes;
      });
    },
  },
};
const nuxt = new Nuxt(config);

function handleRequest(req, res) {
  res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
  return new Promise((resolve, reject) => {
    nuxt.render(req, res, (promise) => {
      promise.then(resolve).catch(reject);
    });
  });
}

app.use(handleRequest);
exports.ssrapp = functions.https.onRequest(app);
