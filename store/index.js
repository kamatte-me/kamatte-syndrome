/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = () => new Vuex.Store({
  state: {
    title: '',
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
     * タイトルを更新する
     * @param state
     * @param title
     */
    updateTitle(state, title) {
      state.title = title;
    },
  },
});

export default store;
