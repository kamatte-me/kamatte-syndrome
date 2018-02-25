<template>
  <div>
    <page-header/>
    <b-tabs position="is-centered" class="block" size="is-medium">
      <b-tab-item v-for="(culturesList, name) in cultures" :label="name" :key="name" >
        <section class="section">
          <div class="container">
            <template v-for="culture in culturesList">
              <h2 class="title" :key="culture.name">{{ culture.name }}</h2>
              <p :key="culture.youtubeVideoId">{{ culture.youtubeVideoId }}</p>
            </template>
          </div>
        </section>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'culture',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Culture',
      cultures: {
        Music: [
          {
            name: '集団行動',
            youtubeVideoId: 'kcqomAJ17fk',
          },
          {
            name: '古都の夕べ',
            youtubeVideoId: 'g-85w1133Hc',
          },
          {
            name: '進行方向別通行区分',
            youtubeVideoId: '_2ShdLz4cz0',
          },
          {
            name: '相対性理論',
            youtubeVideoId: 'nFG4oQE1Et8',
          },
        ],
        Idol: [
          {
            name: '寺嶋由芙',
            youtubeVideoId: 'MrW1nfC4r_U',
          },
          {
            name: 'ゆるめるモ！',
            youtubeVideoId: 'M1EXYQvAIvw',
          },
          {
            name: '生ハムと焼うどん',
            youtubeVideoId: 'Uw2XLLPy2EE',
          },
        ],
      },
    };
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
