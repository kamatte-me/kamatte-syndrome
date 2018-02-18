<template>
  <nav class="navbar is-primary is-fixed-top"
       role="navigation"
       aria-label="main navigation"
  >
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="/logo.png" alt="kamatte syndrome"/>
      </a>
      <div class="navbar-burger"
           v-bind:class="{'is-active': $store.state.isDropdownActive}"
           v-on:click="$store.commit('toggleNavbarDropdown')"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="navbar-menu"
         v-bind:class="{'is-active': $store.state.isDropdownActive}"
    >
      <div class="navbar-start">
        <a class="navbar-item"
           v-bind:class="{'is-active': isCurrentPage(path)}"
           v-for="(path, pageTitle) in $store.state.pages"
           v-bind:href="path"
           :key="pageTitle"
        >
          {{ pageTitle }}
        </a>
      </div>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'navbar',
  methods: {
    /**
     * 渡されたパスが現在表示しているパスか前方一致で判別します
     * @param path
     * @returns {boolean}
     */
    isCurrentPage(path) {
      // eslint-disable-next-line prefer-template
      return new RegExp('^\\' + path).test(this.$route.path);
    },
  },
};
</script>

<style scoped>

</style>
