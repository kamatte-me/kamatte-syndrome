<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <img src="../assets/logo.png" alt="kamatte syndrome"/>
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
           v-for="(url, pageTitle) in $store.state.pages"
           v-bind:href="url"
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
};
</script>

<style scoped>

</style>
