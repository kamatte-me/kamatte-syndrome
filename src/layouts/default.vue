<template>
  <div>
    <header>
      <navbar/>
    </header>
    <main>
      <page-header/>
      <nuxt/>
    </main>
    <site-footer/>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar.vue';
import PageHeader from '~/components/PageHeader.vue';
import SiteFooter from '~/components/SiteFooter.vue';

export default {
  components: {
    Navbar,
    PageHeader,
    SiteFooter,
  },
  head() {
    return {
      title: this.$store.state.pageTitle,
      htmlAttrs: {
        class: 'has-navbar-fixed-top',
      },
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.$store.state.pageTitle,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `${this.$store.state.pageTitle} - kamatte syndrome`,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.$store.state.pageTitle,
        },
      ],
    };
  },
};
</script>
