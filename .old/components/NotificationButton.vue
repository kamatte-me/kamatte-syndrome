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
export default {
  name: 'notification-button',
  methods: {
    /**
     * ブラウザの通知パーミッション取得失敗トースト
     */
    failedPermissionToast() {
      this.$buefy.toast.open({
        message: 'ブラウザの通知設定を「許可」にしてください。',
        type: 'is-green'
      })
    },
    /**
     * 通知登録失敗トースト
     */
    failedSubscribeToast() {
      this.$buefy.toast.open({
        message: '通知登録に失敗しました。もう一度お試しください。',
        type: 'is-green'
      })
    },
    /**
     * 通知登録解除失敗トースト
     */
    failedUnsubscribeToast() {
      this.$buefy.toast.open({
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
              this.$store.commit('notification/setIsLoading', true);
              this.$store.commit('notification/setToken', currentToken);
              // 通知登録
              this.$axios.$put(`${process.env.API_HOST}/notification/subscribe`, {
                token: currentToken,
              })
                .then((res) => {
                  this.$store.commit('notification/setIsSubscribed', true);
                })
                .catch((err) => {
                  this.failedSubscribeToast()
                })
                .finally(() => {
                  this.$store.commit('notification/setIsLoading', false);
                });
            })
            .catch((err) => {
              this.failedSubscribeToast()
            });
        })
        .catch((err) => {
          console.error(err);
          this.failedPermissionToast();
        });
    },
    /**
     * 通知登録解除
     */
    unsubscribe() {
      this.$buefy.dialog.confirm({
        title: 'もっと、かまって。',
        message: '通知止めるって、まじんこ？',
        onConfirm: () => {
          this.$store.commit('notification/setIsLoading', true);
          this.$axios.$put(`${process.env.API_HOST}/notification/unsubscribe`, {
            token: this.$store.state.notification.token,
          })
            .then((res) => {
              this.$store.commit('notification/setIsSubscribed', false);
            })
            .catch((err) => {
              this.failedUnsubscribeToast()
            }).finally(() => {
              this.$store.commit('notification/setIsLoading', false);
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
