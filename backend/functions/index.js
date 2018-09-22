const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const _ = require('lodash');
require('dotenv').config();

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors({
  origin: app.get('env') === 'production' ? 'https://kamatte.me' : '*',
  methods: 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
}));

const TOPIC = 'general';

app.get('/fetch/:token', (req, res) => {
  axios.get(`https://iid.googleapis.com/iid/info/${req.params.token}`, {
    params: {
      details: true,
    },
    headers: {
      Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
    },
  })
    .then((response) => {
      const isSubscribed = _.has(response.data, ['rel', 'topics', TOPIC]);
      res.json({ isSubscribed });
    })
    .catch((error) => {
      console.error(error);
      res.status(500);
    });
});

app.put('/subscribe', (req, res) => {
  admin.messaging().subscribeToTopic(req.body.token, TOPIC)
    .then((response) => {
      console.log('Successfully subscribed to topic:', response);
      res.status(204).send();
    })
    .catch((error) => {
      console.error('Error subscribing to topic:', error);
      res.status(500);
    });
});

app.put('/unsubscribe', (req, res) => {
  admin.messaging().unsubscribeFromTopic(req.body.token, TOPIC)
    .then((response) => {
      console.log('Successfully unsubscribed from topic:', response);
      res.status(204).send();
    })
    .catch((error) => {
      console.error('Error subscribing to topic:', error);
      res.status(500);
    });
});

app.get('/notice', (req, res) => {
  const message = {
    notification: {
      title: 'kamatte syndrome',
      body: 'hogehoge',
    },
    topic: TOPIC,
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send();
    })
    .catch((error) => {
      console.log('Error sending message:', error);
      res.status(500).send();
    });
});

const notification = functions.https.onRequest(app);
module.exports = { notification };
