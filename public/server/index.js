const functions = require('firebase-functions');
const { Nuxt } = require('nuxt');
const express = require('express');

const app = express();

const config = {
  dev: false,
  buildDir: 'nuxt',
  build: {
    publicPath: '/assets/',
  },
};
const nuxt = new Nuxt(config);

function handleRequest(req, res) {
  res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
  nuxt.renderRoute('/')
    .then((result) => {
      res.send(result.html);
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
      res.send(e);
    });
}

app.get('*', handleRequest);

exports.ssrapp = functions.https.onRequest(app);
