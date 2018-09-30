<template>
  <base-layout>
    <page-header/>
    <nuxt/>
  </base-layout>
</template>

<script>
import BaseLayout from '~/components/BaseLayout';
import PageHeader from '~/components/PageHeader';

export default {
  components: {
    BaseLayout,
    PageHeader,
  },
  computed: {
    pageTitle() {
      return this.$store.state.pageTitle;
    },
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
