<template>
  <button @click="$store.state.notification.isSubscribed ? unsubscribe() : subscribe()"
          class="button is-rounded is-primary"
          :class="{ 'is-loading': $store.state.notification.isLoading }">
    <b-icon
      :icon="$store.state.notification.isSubscribed ? 'bell-ring-outline' : 'bell-outline'">
    </b-icon>
  </button>
</template>

<script>
import axios from 'axios';

export default {
  name: 'notification-button',
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
     * 通知登録
     */
    subscribe() {
      // ブラウザの通知パーミッション取得リクエスト
      this.$store.state.notification.messaging.requestPermission()
        .then(() => {
          // トークン取得
          this.$store.state.notification.messaging.getToken()
            .then((currentToken) => {
              this.$store.commit('notification/setIsSubscribed', true);
              this.$store.commit('notification/setToken', currentToken);
              // 通知登録
              axios.put(`${process.env.API_HOST}/notification/subscribe`, {
                token: currentToken,
              })
                .then((res) => {})
                .catch((err) => {
                  this.$store.commit('notification/setIsSubscribed', false);
                  this.failedSubscribeToast()
                });
            })
            .catch((err) => {
              this.failedSubscribeToast()
            });
        })
        .catch((err) => {
          console.log(err);
          this.failedPermissionToast();
        });
    },
    /**
     * 通知登録解除
     */
    unsubscribe() {
      this.$dialog.confirm({
        title: 'もっと、かまって。',
        message: '通知止めるって、まじんこ？',
        onConfirm: () => {
          this.$store.commit('notification/setIsSubscribed', false);
          axios.put(`${process.env.API_HOST}/notification/unsubscribe`, {
            token: this.$store.state.notification.token,
          })
            .then((res) => {})
            .catch((err) => {
              this.$store.commit('notification/setIsSubscribed', true);
              this.failedUnsubscribeToast()
            });
        },
        confirmText: 'まじんこ',
        cancelText: '虚言',
        focusOn: 'cancel',
        type: 'is-danger',
      });
    },
  },
};
</script>
