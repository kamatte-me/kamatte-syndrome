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
          imagePath: '/images/orenoe/bi-to_ban_to_koma.jpg',
        },
        {
          title: 'おばあちゃんの',
          imagePath: '/images/orenoe/obaachan_no.jpg',
        },
        {
          title: '当たり障りない騙し合い',
          imagePath: '/images/orenoe/atarisawari_nai_damashiai.jpg',
        },
        {
          title: 'おでかけ',
          imagePath: '/images/orenoe/odekake.jpg',
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
