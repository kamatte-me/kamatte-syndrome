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

  /**
   * 通知登録状況取得
   */
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
        console.error('Error get token info: ', error);
        res.status(500).send();
      });
  });

  /**
   * 通知登録
   */
  router.put('/subscribe', (req, res) => {
    admin.messaging().subscribeToTopic(req.body.token, TOPIC)
      .then(() => {
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
          token: req.body.token,
        };
        admin.messaging().send(message)
          .then(() => {})
          .catch((error) => {
            console.error('Error sending Welcome message: ', error);
          });
      })
      .catch((error) => {
        console.error('Error subscribing to topic: ', error);
        res.status(500).send();
      });
  });

  /**
   * 通知登録解除
   */
  router.put('/unsubscribe', (req, res) => {
    admin.messaging().unsubscribeFromTopic(req.body.token, TOPIC)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => {
        console.error('Error unsubscribing to topic: ', error);
        res.status(500).send();
      });
  });

  /**
   * 通知実行（テスト用）
   * TODO: ContentfulのWebHookを実装
   * TODO: 通知実行用の管理画面
   */
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
      .then(() => {
        res.status(200).send();
      })
      .catch((error) => {
        console.error('Error sending message: ', error);
        res.status(500).send();
      });
  });

  return router;
};
