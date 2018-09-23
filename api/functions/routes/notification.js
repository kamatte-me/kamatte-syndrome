const functions = require('firebase-functions');
const express = require('express');
const axios = require('axios');
const _ = require('lodash');

/**
 * 通知ルーター
 * @param admin Firebase Admin Object
 * @returns {Router} 通知ルーター
 */
module.exports = (admin) => {
  const fcmServerKey = functions.config().fcm.serverkey;
  const TOPIC = 'general';

  const router = express.Router();

  router.get('/subscription/:token', (req, res) => {
    axios.get(`https://iid.googleapis.com/iid/info/${req.params.token}`, {
      params: {
        details: true,
      },
      headers: {
        Authorization: `key=${fcmServerKey}`,
      },
    })
      .then((response) => {
        const isSubscribed = _.has(response.data, ['rel', 'topics', TOPIC]);
        res.json({ isSubscribed });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send();
      });
  });

  router.put('/subscribe', (req, res) => {
    const token = req.body.token;
    admin.messaging().subscribeToTopic(token, TOPIC)
      .then((response) => {
        console.log('Successfully subscribed to topic:', response);
        res.status(204).send();

        // ウェルカム通知を送信
        const message = {
          webpush: {
            notification: {
              title: 'とうろく、ありがぽ。',
              body: 'ずっと、かまって。',
              icon: '/logo.png',
            },
          },
          token: token,
        };
        admin.messaging().send(message)
          .then((res) => {
            console.log('Successfully sent Welcome message:', res);
          })
          .catch((err) => {
            console.log('Error sending Welcome message:', err);
          });
      })
      .catch((error) => {
        console.error('Error subscribing to topic:', error);
        res.status(500).send();
      });
  });

  router.put('/unsubscribe', (req, res) => {
    admin.messaging().unsubscribeFromTopic(req.body.token, TOPIC)
      .then((response) => {
        console.log('Successfully unsubscribed from topic:', response);
        res.status(204).send();
      })
      .catch((error) => {
        console.error('Error subscribing to topic:', error);
        res.status(500).send();
      });
  });

  router.get('/notice', (req, res) => {
    const message = {
      webpush: {
        notification: {
          title: 'kamatte syndrome',
          body: 'hogehoge',
          icon: '/logo.png',
        },
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

  return router;
};
