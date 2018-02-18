import Vuex from 'vuex';

const store = () => new Vuex.Store({
  state: {
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
    toggleNavbarDropdown(state) {
      // eslint-disable-next-line no-param-reassign
      state.isDropdownActive = !state.isDropdownActive;
    },
  },
});

export default store;
