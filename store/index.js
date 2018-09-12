import Vuex from 'vuex';

const store = () => new Vuex.Store({
  state: {
    pageTitle: '',
  },
  mutations: {
    /**
     * タイトルを更新する
     * @param state
     * @param pageTitle
     */
    updatePageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
    },
  },
});

export default store;
