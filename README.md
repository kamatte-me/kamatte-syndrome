# kamatte syndrome

> kamatte syndrome<br>
https://kamatte.me

plz kamatte me!!!


## Features

* SPA (Single Page Application)
* SSR (Sever Side Rendering)
* PWA (Progressive Web Apps)
* Serverless (Node.js / Google App Engine Standard Environment, Cloud Functions for Firebase)


## Frameworks

* [Nuxt.js](https://github.com/nuxt/nuxt.js) v2.x
* [Buefy](https://buefy.github.io/#/)
* Sass ([FLOCCS](https://github.com/hiloki/flocss) style)


## Requires

* Node.js v10.15.3
* Google Cloud SDK
* [Firebase CLI](https://firebase.google.com/docs/cli)

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
$ npm install

# Serve with hot reload at http://localhost:3000
$ npm run dev

# Build for production and launch server
$ npm run build
$ npm run start

# Build and Deploy to GAE/SE
$ npm run deploy
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

### `/api`

``` bash
# Install dependencies
$ npm install

# Serve with hot reload at http://localhost:5000
$ npm run serve

# Build and Deploy to Cloud Functions for Firebase
$ npm run deploy
```
