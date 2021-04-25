export const strict = false;

export const state = () => ({
  pageTitle: '',
});

export const mutations = {
  /**
   * タイトルを更新する
   * @param state
   * @param pageTitle
   */
  updatePageTitle(state, pageTitle) {
    state.pageTitle = pageTitle;
  },
};

export const actions = {
  async nuxtClientInit({ commit, dispatch }, context) {
    commit('notification/initMessaging');
    await dispatch('notification/getFcmToken');
    await dispatch('notification/setOnMessageEvent');
    await dispatch('notification/setOnTokenRefreshEvent');
  }
};
