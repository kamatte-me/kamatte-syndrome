# kamatte syndrome

> kamatte syndrome
https://kamatte.me

## Feature

* SPA (Single Page Application)
* SSR (Sever Side Rendering)
* PWA (Progressive Web Apps)
* Serverless (Cloud Functions for Firebase + Firebase Hosting)

## Technologies

* [Node.js](https://github.com/nodejs/node) v6.11.5
* [Nuxt.js](https://github.com/nuxt/nuxt.js)
* [Buefy](https://buefy.github.io/#/)
* Sass ([FLOCCS](https://github.com/hiloki/flocss) style)

## Build Setup

``` bash
$ cd src

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
# npm install at source and server
$ cd src && npm install
$ cd functions && npm install

# Build
$ cd src && npm run build

# Setup
$ rm -rf public/*
$ cp -R functions/nuxt/dist/ public/assets
$ cp -R src/static/* public

# Firebase serve on local
$ npm run serve

# Deploy!!!
$ npm run deploy
```
