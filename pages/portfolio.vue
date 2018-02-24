<template>
  <div>
    <page-header/>
    <section class="section">
      <div class="container">
        <div class="columns" v-for="(work, index) in works" :key="index">
          <div class="column is-one-third has-text-centered">
            <img :src="work.imagePath" width="150" height="150"/>
          </div>
          <div class="column">
            <div class="content">
              <div class="block has-text-centered-mobile">
                <h2 class="title">
                  <a v-if="work.url !== undefined" :href="work.url" target="_blank">
                    {{ work.title }}
                  </a>
                  <template v-else>
                    {{ work.title }}
                  </template>
                </h2>
                <p class="subtitle is-6 has-text-grey-light">{{ work.charge }}</p>
              </div>
              <p v-html="work.description"></p>
            </div>
            <aside class="tags">
              <div class="tag" v-for="tag in work.tags" :key="tag">
                {{ tag }}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'portfolio',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Portfolio',
      works: [
        {
          title: 'kamatte syndrome',
          imagePath: '/avatar.png',
          charge: 'ソロプロジェクト',
          description: 'いま、あなたといる、ここ。',
          tags: [
            'JavaScript',
            'Vue',
            'Nuxt.js',
            'HTML',
            'SCSS',
            'Bulma',
            'GCP',
            'Firebase',
          ],
        },
        {
          title: '集団活動',
          url: 'https://syudan.me',
          imagePath: '/avatar.png',
          charge: 'ソロプロジェクト',
          description: 'バンド「<a href="https://www.syudan.com">集団行動</a>」の非公式ファンサイトです。',
          tags: [
            'Ruby',
            'Ruby on Rails',
            'JavaScript',
            'React',
            'HTML',
            'CSS',
            'Semantic UI',
            'MariaDB',
            'Nginx',
            'Ubuntu',
          ],
        },
      ],
    };
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
