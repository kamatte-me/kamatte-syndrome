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
import siteFooter from '~/components/SiteFooter.vue';

export default {
  components: {
    Navbar,
    siteFooter,
  },
  head() {
    return {
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'kamatte syndrome' },
        { hid: 'og:url', property: 'og:url', content: 'https://kamatte.me' },
      ],
    };
  },
};
</script>
