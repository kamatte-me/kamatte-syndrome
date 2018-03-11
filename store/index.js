/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = () => new Vuex.Store({
  state: {
    blogCurrentPage: 1,
  },
  mutations: {
    /**
     * ブログのページを更新する
     * @param state
     * @param currentPage
     */
    updateBlogCurrentPage(state, currentPage) {
      state.blogCurrentPage = currentPage;
    },
  },
});

export default store;
