import firebase from '~/plugins/firebase';

export const state = () => ({
  messaging: null,
  isLoading: true,
  token: null,
  isSubscribed: false,
});

export const getters = {
  isSupported(state) {
    return state.messaging !== null;
  },
};

export const mutations = {
  initMessaging(state) {
    if (!firebase.messaging.isSupported()) {
      return;
    }
    state.messaging = firebase.messaging();
  },
  setIsLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setToken(state, token) {
    state.token = token;
  },
  setIsSubscribed(state, isSubscribed) {
    state.isSubscribed = isSubscribed;
  },
};

export const actions = {
  /**
   * Firebase Cloud Messagingトークン取得
   * @param commit
   * @param state
   */
  getFcmToken({ commit, state }) {
    if (!firebase.messaging.isSupported()) {
      return;
    }

    state.messaging.getToken()
      .then((currentToken) => {
        if (currentToken) {
          commit('setToken', currentToken);
          // トークンの通知登録状況取得
          this.$axios.$get(`${process.env.API_HOST}/notification/subscription/${currentToken}`)
            .then((res) => {
              commit('setIsSubscribed', res.isSubscribed);
            })
            .catch((err) => {})
            .finally(() => {
              commit('setIsLoading', false);
            });
        } else {
          commit('setIsLoading', false);
        }
      })
      .catch((err) => {
        commit('setIsLoading', false);
      });
  },
  /**
   * フォアグラウンドでのプッシュ通知取得時イベント
   * @param state
   */
  setOnMessageEvent({ state }) {
    if (!firebase.messaging.isSupported()) {
      return;
    }

    state.messaging.onMessage((payload) => {
      const notification = payload.notification;
      const title = notification.title || 'kamatte syndrome';
      const options = {
        body: notification.body || '何かしらアップデートしますた。',
        icon: notification.icon || '/logo.png',
      };
      const notify = new Notification(title, options);

      // 通知クリック時リンク
      if (notification.click_action !== undefined) {
        const link = notification.click_action;
        notify.addEventListener('click', () => {
          open(link);
        });
      }
    });
  },
  /**
   * トークン更新時のイベント
   * @param state
   */
  setOnTokenRefreshEvent({ state }) {
    if (!firebase.messaging.isSupported()) {
      return;
    }

    state.messaging.onTokenRefresh(() => {
      this.getFcmToken();
    });
  }
};
