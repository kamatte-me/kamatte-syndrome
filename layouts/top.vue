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
import Navbar from '~/components/Navbar';
import SiteFooter from '~/components/SiteFooter';
import firebase from '~/plugins/firebase';

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
