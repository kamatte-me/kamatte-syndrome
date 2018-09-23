<template>
  <button @click="isSubscribed ? unsubscribe() : subscribe()"
          class="button is-rounded is-primary"
          :class="{ 'is-loading': isLoading }">
    <b-icon
      :icon="isSubscribed ? 'bell' : 'bell-off'">
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
     * ブラウザの通知パーミッション取得失敗トースト
     */
    failedPermissionToast() {
      this.$toast.open({
        message: 'ブラウザの通知設定を「許可」にしてください。',
        type: 'is-green'
      })
    },
    /**
     * 通知登録失敗トースト
     */
    failedSubscribeToast() {
      this.$toast.open({
        message: '通知登録に失敗しました。もう一度お試しください。',
        type: 'is-green'
      })
    },
    /**
     * 通知登録解除失敗トースト
     */
    failedUnsubscribeToast() {
      this.$toast.open({
        message: '通知登録解除に失敗しました。もう一度お試しください。',
        type: 'is-green'
      })
    },
    /**
     * トークン取得
     */
    getToken() {
      this.messaging.getToken()
        .then((currentToken) => {
          this.token = currentToken;
          // トークンの通知登録状況取得
          axios.get(`${process.env.API_HOST}/notification/subscription/${this.token}`)
            .then((res) => {
              this.isSubscribed = res.data.isSubscribed;
            })
            .catch((err) => {})
            .finally(() => {
              this.isLoading = false;
            });
        })
        .catch((err) => {
          this.isLoading = false;
        });
    },
    /**
     * 通知登録
     */
    subscribe() {
      // ブラウザの通知パーミッション取得リクエスト
      this.messaging.requestPermission()
        .then(() => {
          // トークン取得
          this.messaging.getToken()
            .then((currentToken) => {
              this.isSubscribed = true;
              this.token = currentToken;
              // 通知登録
              axios.put(`${process.env.API_HOST}/notification/subscribe`, {
                token: this.token,
              })
                .then((res) => {})
                .catch((err) => {
                  this.isSubscribed = false;
                  this.failedSubscribeToast()
                });
            })
            .catch((err) => {
              this.failedSubscribeToast()
            });
        })
        .catch((err) => {
          this.failedPermissionToast();
        });
    },
    /**
     * 通知登録解除
     */
    unsubscribe() {
      this.isSubscribed = false;
      axios.put(`${process.env.API_HOST}/notification/unsubscribe`, {
        token: this.token,
      })
        .then((res) => {})
        .catch((err) => {
          this.isSubscribed = true;
          this.failedUnsubscribeToast()
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

    /**
     * プッシュ通知取得時
     */
    this.messaging.onMessage(function(payload) {
      const message = payload.notification;
      const title = message.title;
      const options = {
        body: message.body,
        icon: message.icon,
      };
      new Notification(title, options);
    });
  },
};
</script>
