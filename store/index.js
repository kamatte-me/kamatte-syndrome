/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = () => new Vuex.Store({
  state: {
    pageTitle: '',
    isDropdownActive: false,
    pages: {
      Biography: '/biography',
      Portfolio: '/portfolio',
      Illustration: '/illustration',
      Culture: '/culture',
      Blog: '/blog',
    },
  },
  mutations: {
    /**
     * モバイル表示時のハンバーガーボタンを展開/格納を切り替える
     * @param state
     */
    toggleNavbarDropdown(state) {
      state.isDropdownActive = !state.isDropdownActive;
    },
    /**
     * モバイル表示時のハンバーガーボタンを格納する
     * @param state
     */
    closeNavbarDropdown(state) {
      state.isDropdownActive = false;
    },
    /**
     * ページタイトルを更新する
     * @param state
     * @param pageTitle
     */
    updatePageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
    },
  },
});

export default store;
