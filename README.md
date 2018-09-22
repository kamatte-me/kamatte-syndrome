# kamatte syndrome

> kamatte syndrome<br>
https://kamatte.me


## Feature

* SPA (Single Page Application)
* SSR (Sever Side Rendering)
* PWA (Progressive Web Apps)
* Serverless (Node.js / Google App Engine Standard Environment, Cloud Functions for Firebase)


## Technologies

* [Node.js](https://github.com/nodejs/node) v8.11.1
* [Nuxt.js](https://github.com/nuxt/nuxt.js) v1.x
* [Buefy](https://buefy.github.io/#/)
* Sass ([FLOCCS](https://github.com/hiloki/flocss) style)


## Requires

* Node.js v8.11.1
* [Yarn](https://yarnpkg.com/)
* Google Cloud SDK

Please read [Quickstart for Node.js in the App Engine Standard Environment](https://cloud.google.com/appengine/docs/standard/nodejs/quickstart) and setup.


## Monorepo

### `/web`

Web site (Nuxt.js) on Google App Engine

### `/api`

API server (Express.js) on Cloud Functions for Firebase


## Build Setup

### `/web`

``` bash
# Install dependencies
$ yarn install

# Serve with hot reload at localhost:3000
$ yarn run dev

# Build for production and launch server
$ yarn run build
$ yarn run start

# Build and Deploy to GAE/SE
$ yarn run deploy
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

### `/api`

``` bash
# Install dependencies
$ yarn install

# Serve with hot reload at localhost:5000
$ yarn run serve

# Build and Deploy to GAE/SE
$ yarn run deploy
```
