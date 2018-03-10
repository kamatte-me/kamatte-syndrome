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

const generateTitle = (pageTitle) => {
  const baseTitle = 'kamatte syndrome';
  if (pageTitle.length === 0) {
    return baseTitle;
  }
  // eslint-disable-next-line prefer-template
  return pageTitle + ' - ' + baseTitle;
};

export default {
  components: {
    Navbar,
    siteFooter,
  },
  head() {
    return {
      title: generateTitle(this.$store.state.pageTitle),
    };
  },
};
</script>
