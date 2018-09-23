<template>
  <base-layout>
    <nuxt/>
  </base-layout>
</template>

<script>
import BaseLayout from '~/components/BaseLayout';

export default {
  components: {
    BaseLayout,
  },
  head() {
    return {
      titleTemplate: 'kamatte syndrome',
    };
  },
};
</script>
