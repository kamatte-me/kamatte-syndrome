<template>
  <div>
    <section class="hero is-fullheight is-primary">
      <div class="hero-body">
        <div class="container is-fluid has-text-centered">
          <h1 class="title p-index_eyecatch">
            kamatte
            <img class="p-index_eyecatch-logo" src="/logo.png" width="60px" height="60px"/>
            syndrome
          </h1>
        </div>
      </div>
    </section>
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container is-fluid has-text-centered">
          <nuxt-link to="/biography">
            <p class="title is-1 has-text-green p-index_speech">
              <img class="p-index_eyecatch-avatar" src="/avatar.png" width="130" height="130"/>
              plz kamatte me!!!
            </p>
          </nuxt-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  layout: 'top',
  beforeCreate() {
    this.$store.commit('updatePageTitle', '');
  },
};
</script>
