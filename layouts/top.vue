<template>
  <div>
    <header>
      <navbar/>
    </header>
    <main>
      <nuxt/>
    </main>
    <site-footer/>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar.vue';
import SiteFooter from '~/components/SiteFooter.vue';

export default {
  name: 'top',
  components: {
    Navbar,
    SiteFooter,
  },
  head() {
    return {
      titleTemplate: 'kamatte syndrome',
    };
  },
};
</script>

<style scoped>

</style>
