# kamatte syndrome

> Next kamatte syndrome

* [Node.js](https://github.com/nodejs/node) v6.11.5
* [Nuxt.js](https://github.com/nuxt/nuxt.js)
* [Buefy](https://buefy.github.io/#/)
* Sass ([FLOCCS](https://github.com/hiloki/flocss) style)

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


## Build and Deploy to Firebase

``` bash
# Setup firebase tools
$ npm i -g firebase-tools

# npm install at source and server
$ npm install
$ cd public/server && npm install

# Build and Setup
$ npm run build
$ rm -rf public/client/*
$ cp -R public/server/nuxt/dist/ public/client/assets
$ cp -R static/ public/client

# Simulate Firebase on local
$ firebase serve --only functions,hosting

# Deploy!
$ firebase deploy
```
