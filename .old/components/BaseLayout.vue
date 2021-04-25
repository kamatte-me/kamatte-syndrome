<template>
  <div>
    <header>
      <navbar/>
    </header>
    <main>
      <slot/>
    </main>
    <site-footer/>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar';
import SiteFooter from '~/components/SiteFooter';

export default {
  components: {
    Navbar,
    SiteFooter,
  },
};
</script>
