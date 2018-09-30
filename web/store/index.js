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
