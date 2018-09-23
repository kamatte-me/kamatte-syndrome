<template>
  <button v-if="isSubscribed"
          v-on:click="unSubscribe"
          class="button is-rounded is-outlined is-primary is-inverted"
          :class="{ 'is-loading': isLoading }">
    <b-icon
      icon="bell">
    </b-icon>
  </button>
  <button v-else
          v-on:click="subscribe"
          class="button is-rounded is-outlined is-primary is-inverted"
          :class="{ 'is-loading': isLoading }">
    <b-icon
      icon="bell-off">
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
      isLoading: true,
      messaging: null,
      token: null,
      isSubscribed: false,
    };
  },
  methods: {
    /**
     * トークンの通知登録状況取得
     */
    fetchSubscription() {
      axios.get(`${process.env.API_HOST}/notification/subscription/${this.token}`)
        .then((res) => {
            this.isSubscribed = res.data.isSubscribed;
        })
        .catch((err) => {});
    },
    /**
     * トークン取得
     */
    getToken() {
      this.messaging.getToken()
        .then((currentToken) => {
          this.token = currentToken;
          this.fetchSubscription();
        })
        .catch((err) => {})
        .finally(() => {
          this.isLoading = false;
        });
    },
    /**
     * 通知登録
     */
    subscribe() {
      this.messaging.requestPermission().then(() => {
        this.messaging.getToken().then((currentToken) => {
          this.isSubscribed = true;
          this.token = currentToken;
          axios.put(`${process.env.API_HOST}/notification/subscribe`, {
            token: this.token,
          })
            .then((res) => {})
            .catch((err) => {
              console.error('登録エラー: ', err);
              this.isSubscribed = false;
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
      this.isSubscribed = false;
      axios.put(`${process.env.API_HOST}/notification/unsubscribe`, {
        token: this.token,
      })
        .then((res) => {})
        .catch((err) => {
          console.error('登録解除エラー: ', err);
          this.isSubscribed = true;
        });
    },
  },
  beforeMount() {
    this.messaging = firebase.messaging();

    // トークン取得
    this.getToken();

    // トークン更新時のイベント
    this.messaging.onTokenRefresh(() => {
      this.getToken();
    });
  },
};
</script>

<style scoped>
  .button.is-primary.is-outlined.is-loading::after {
    border-color: transparent transparent #fff #fff !important;
  }
</style>