<template>
  <div>
    <page-header/>
    <section class="section">
      <ul>
        <li>test</li>
      </ul>
    </section>
  </div>
</template>

<script>
import PageHeader from '../../components/PageHeader.vue';

export default {
  name: 'index',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Blog',
    };
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
