<template>
  <button v-if="isSubscribed" v-on:click="unSubscribe">
    <b-icon
      icon="bell"
      type="is-github"
      size="is-medium">
    </b-icon>
  </button>
  <button v-else v-on:click="subscribe">
    <b-icon
      icon="bell-off"
      type="is-github"
      size="is-medium">
    </b-icon>
  </button>
</template>

<script>
import firebase from '~/plugins/firebase';
import axios from 'axios';

export default {
  name: 'notification',
  data() {
    return {
      messaging: null,
      token: null,
      isSubscribed: false,
    };
  },
  methods: {
    /**
     * 通知登録状況取得
     */
    fetch() {
      axios.get(`${process.env.API_HOST}/notification/fetch/${this.token}`)
        .then((res) => {
          this.isSubscribed = res.data.isSubscribed;
        });
    },
    /**
     * 通知登録
     */
    subscribe() {
      this.messaging.requestPermission().then(() => {
        this.messaging.getToken().then((currentToken) => {
          this.token = currentToken;
          axios.put(`${process.env.API_HOST}/notification/subscribe`, {
            token: this.token,
          })
            .then((res) => {
              this.isSubscribed = true;
            })
            .catch((err) => {
              console.error('登録エラー: ', err)
            });
        }).catch((err) => {
          console.error('Unable to retrieve newed token ', err);
        });
      }).catch((err) => {
        console.error('Unable to get permission to notify.', err);
      });
    },
    /**
     * 通知登録解除
     */
    unSubscribe() {
      axios.put(`${process.env.API_HOST}/notification/unsubscribe`, {
        token: this.token,
      })
        .then((res) => {
          this.isSubscribed = false;
        })
        .catch((err) => {
          console.error('登録解除エラー: ', err)
        });
    },
  },
  beforeMount() {
    this.messaging = firebase.messaging();

    // トークン取得
    this.messaging.getToken().then((currentToken) => {
      this.token = currentToken;
      this.fetch();
    });

    // トークン更新時のイベント
    this.messaging.onTokenRefresh(() => {
      this.messaging.getToken().then((refreshedToken) => {
        this.token = refreshedToken;
        this.fetch();
      });
    });
  },
};
</script>
