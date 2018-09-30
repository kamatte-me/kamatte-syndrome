const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const serviceAccount = require('./serviceAccountKey.json');

const notification = require('./routes/notification');

// Firebase Admin
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(adminConfig);

// Express Settings
const app = express();
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});
app.use(cors({
  origin: app.get('env') === 'production' ? 'https://kamatte.me' : '*',
  methods: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
}));

// Routes
app.use('/notification', notification(admin));

const api = functions.region('asia-northeast1').https.onRequest(app);
module.exports = { api };
