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

# Install dependencies
$ yarn install

# Serve with hot reload at localhost:3000
$ yarn run dev

# Build for production and launch server
$ yarn run build
$ yarn start

# Generate static project
$ yarn run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


## Build and Deploy to Firebase

``` bash
# Install dependencies at source and server
$ cd src && yarn install
$ cd functions && yarn install

# Build
$ cd src && yarn run build

# Setup
$ yarn run setup

# Firebase serve on local
$ yarn run serve

# Deploy!!!
$ yarn run deploy
```
