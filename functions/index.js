const functions = require('firebase-functions');
const express = require('express');
const { Nuxt } = require('nuxt');
const nuxtConfig = require('./.nuxt.config');

const app = express();
const nuxt = new Nuxt(nuxtConfig);

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
