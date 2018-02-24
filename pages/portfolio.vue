<template>
  <div>
    <page-header/>
    <section class="section">
      <div class="container">
        <ul class="p-portfolio_worksWrap">
          <li v-for="portfolio in sortedPortfolio" :key="portfolio.year">
            <h1 class="title has-text-centered p-portfolio_year">
              {{ portfolio.year }}
            </h1>
            <div class="columns p-portfolio_worksWrap_workWrap"
                 v-for="(work, index) in portfolio.works" :key="index"
            >
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
                  <div class="tag is-green" v-for="tag in work.tags" :key="tag">
                    {{ tag }}
                  </div>
                </aside>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import _ from 'lodash';
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'portfolio',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Portfolio',
      portfolio: [
        {
          year: 2018,
          works: [
            {
              title: 'kamatte syndrome',
              imagePath: '/logo.png',
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
          ],
        },
        {
          year: 2017,
          works: [
            {
              title: '集団活動',
              url: 'https://syudan.me',
              imagePath: '/images/syudan_katsudou.png',
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
            {
              title: 'レビューサイトにおけるレビュアーの信頼度評価システムの研究',
              imagePath: '/images/rihh.png',
              charge: '卒業研究',
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
        },
      ],
    };
  },
  computed: {
    sortedPortfolio() {
      return _.sortBy(this.portfolio, 'year').reverse();
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
