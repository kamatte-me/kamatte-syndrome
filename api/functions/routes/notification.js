const functions = require('firebase-functions');
const express = require('express');
const basicAuth = require('basic-auth-connect');
const axios = require('axios');
const _ = require('lodash');
const contentful = require('contentful');

/**
 * 通知ルーター
 * @param admin Firebase Admin Object
 * @returns {Router} 通知ルーター
 */
module.exports = (admin) => {
  const fcmServerKey = functions.config().fcm.serverkey;
  const TOPIC = process.env.NODE_ENV === 'production' ? 'general' : 'test';
  const LANG = 'ja-JP';

  const contentfulClient = contentful.createClient({
    space: 'ky376v5x3o44',
    accessToken: functions.config().contentful.cdaaccesstoken,
  });

  const router = express.Router();

  // 本番環境ではWebHooksエンドポイントでBasic認証を実施
  if (process.env.NODE_ENV === 'production') {
    router.all('/webhook/*', basicAuth((user, password) => {
      const actual = {
        user: functions.config().basicauth.user,
        password: functions.config().basicauth.password,
      };
      return user === actual.user && password === actual.password;
    }));
  }

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
        console.error('Error get token info:', error);
        res.status(500).end();
      });
  });

  /**
   * 通知登録
   */
  router.put('/subscribe', (req, res) => {
    admin.messaging().subscribeToTopic(req.body.token, TOPIC)
      .then(() => {
        res.status(204).end();

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
          .then(() => { })
          .catch((error) => {
            console.error('Error sending Welcome message:', error);
          });
      })
      .catch((error) => {
        console.error('Error subscribing to topic:', error);
        res.status(500).end();
      });
  });

  /**
   * 通知登録解除
   */
  router.put('/unsubscribe', (req, res) => {
    admin.messaging().unsubscribeFromTopic(req.body.token, TOPIC)
      .then(() => {
        res.status(204).end();
      })
      .catch((error) => {
        console.error('Error unsubscribing to topic:', error);
        res.status(500).end();
      });
  });

  /**
   * ブログ更新通知実行WebHooksエンドポイント
   */
  router.post('/webhook/blog', (req, res) => {
    const fields = req.body.fields;
    const post = {
      title: fields.title[LANG],
      slug: fields.slug[LANG],
      featuredImage: '/logo.png',
    };

    // 初回公開時（revision: 1）のみ通知
    if (req.body.sys.revision !== 1) {
      const resBody = 'Not notified because of existing entry update.';
      console.log(`${resBody}:`, post.title);
      res.status(208).end(resBody);
      return;
    }

    // 同期処理で画像取得
    new Promise(((resolve, reject) => {
      if (_.has(req.body, ['fields', 'featuredImage'])) {
        contentfulClient.getEntries({
          'sys.id': req.body.sys.id,
        })
          .then((entries) => {
            post.featuredImage = `https:${entries.items[0].fields.featuredImage.fields.file.url}`;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    }))
      .then(() => {
        const message = {
          notification: {
            title: 'かましん、こーしん。',
            body: post.title,
          },
          webpush: {
            notification: {
              icon: post.featuredImage,
              click_action: `https://kamatte.me/blog/${post.slug}`,
            },
          },
          topic: TOPIC,
        };

        admin.messaging().send(message)
          .then(() => {
            console.log('Notify completed:', post.title);
            res.status(200).end('Notify completed.');
          })
          .catch((error) => {
            console.error('Notify failed:', post.title);
            console.error('Error sending message:', error);
            res.status(500).end();
          });
      })
      .catch((error) => {
        console.error('Notify failed:', post.title);
        console.error('Error get entries:', error);
        res.status(500).end();
      });
  });

  /**
   * ニュース通知実行WebHooksエンドポイント
   */
  router.post('/webhook/news', (req, res) => {
    const fields = req.body.fields;
    const news = {
      title: fields.title[LANG],
      body: fields.body[LANG],
      url: fields.url === undefined ? null : fields.url[LANG],
      image: '/logo.png',
    };

    // 初回公開時（revision: 1）のみ通知
    if (req.body.sys.revision !== 1) {
      const resBody = 'Not notified because of existing entry update.';
      console.log(`${resBody}:`, news.title);
      res.status(208).end(resBody);
      return;
    }

    // 同期処理で画像取得
    new Promise(((resolve, reject) => {
      if (_.has(req.body, ['fields', 'image'])) {
        contentfulClient.getEntries({
          'sys.id': req.body.sys.id,
        })
          .then((entries) => {
            news.image = `https:${entries.items[0].fields.image.fields.file.url}`;
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    }))
      .then(() => {
        const message = {
          notification: {
            title: news.title,
            body: news.body,
          },
          webpush: {
            notification: {
              icon: news.image,
              click_action: news.url,
            },
          },
          topic: TOPIC,
        };

        admin.messaging().send(message)
          .then(() => {
            console.log('Notify completed:', news.title);
            res.status(200).end('Notify completed.');
          })
          .catch((error) => {
            console.error('Notify failed:', news.title);
            console.error('Error sending message:', error);
            res.status(500).end();
          });
      })
      .catch((error) => {
        console.error('Notify failed:', news.title);
        console.error('Error get entries:', error);
        res.status(500).end();
      });
  });

  return router;
};
