<template>
  <div>
    <page-header/>
    <section class="section">
      <div class="container">
        <div class="columns"
             v-for="(illustrationsList, index) in splitIllustrationsList(maxColumns)"
             :key="index"
        >
          <article class="column"
               v-for="illustration in illustrationsList" :key="illustration.title"
          >
            <div class="box">
              <h2 class="title has-text-centered">{{ illustration.title }}</h2>
              <figure class="has-text-centered">
                <img :src="illustration.imagePath"/>
              </figure>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import _ from 'lodash';
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'illustration',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: '俺の絵',
      maxColumns: 2,
      illustrations: [
        {
          title: 'コマとビート板が遊んでいるところ',
          imagePath: '/logo.png',
        },
        {
          title: 'おばあちゃんの',
          imagePath: '/logo.png',
        },
        {
          title: '当たり障りない騙し合い',
          imagePath: '/logo.png',
        },
        {
          title: 'おでかけ',
          imagePath: '/logo.png',
        },
      ],
    };
  },
  methods: {
    splitIllustrationsList(columns) {
      return _.chunk(this.illustrations, columns);
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>

<style scoped>

</style>
