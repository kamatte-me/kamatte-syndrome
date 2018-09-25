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
   * Google Instance ID API: https://developers.google.com/instance-id/reference/server
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
          notification: {
            title: 'とうろく、ありがぽ。',
            body: 'ずっと、かまって。',
          },
          webpush: {
            notification: {
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
   * https://firebase.google.com/docs/cloud-messaging/js/receive?hl=ja#setting_notification_options_in_the_send_request
   * TODO: ContentfulのWebHookを実装
   * TODO: 通知実行用の管理画面
   */
  router.get('/notice', (req, res) => {
    // TODO: Basic認証 https://github.com/jshttp/basic-auth#readme
    const message = {
      notification: {
        title: 'かましん、こーしん。',
        body: 'hoge',
      },
      webpush: {
        notification: {
          icon: '/logo.png',
          click_action: 'https://kamatte.me',
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
