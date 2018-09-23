import firebase from '~/plugins/firebase';

export const state = () => ({
  messaging: null,
  isLoading: true,
  token: null,
  isSubscribed: false,
});

export const mutations = {
  initMessaging(state) {
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
