/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

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
