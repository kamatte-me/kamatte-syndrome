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
                <figure v-if="work.imagePath !== undefined">
                  <a v-if="work.url !== undefined" :href="work.url" target="_blank">
                    <img :src="work.imagePath" class="p-portfolio_worksWrap_workWrap--image"/>
                  </a>
                  <template v-else>
                    <img :src="work.imagePath" class="p-portfolio_worksWrap_workWrap--image"/>
                  </template>
                </figure>
                <div class="p-portfolio_worksWrap_workWrap--noimage" v-else></div>
              </div>
              <div class="column">
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
                <div class="content">
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
        <aside class="p-portfolio_aside">
          <p class="has-text-grey has-text-right-widescreen">
            その他、iOSアプリ、Androidアプリ、Webアプリ（Ruby on Rails, Python, PHP, Java, Scala）など。<br>
            フルスタックにがんばってむす。
          </p>
        </aside>
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
              title: 'T*****c',
              charge: 'ソロプロジェクト',
              description: 'カァミングスゥーーーン',
              tags: [
                'Golang',
                'JavaScript',
                'Vue',
                'Nuxt.js',
                'HTML',
                'SCSS',
                'Bulma',
                'Python',
                'Machine Learning',
                'GCP',
                'GAE',
                'Firebase',
              ],
            },
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
              description: 'バンド「<a href="https://www.syudan.com" target="_blank">集団行動</a>」の非公式ファンサイトです。',
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
              description: 'レビュー関係を二部グラフでモデル化し、' +
              '機械学習でレビュアーの信頼度を評価するアルゴリズムをつくりました。<br>' +
              '中間発表会では学科最優秀賞を頂きました。副賞はUSB2.0メモリ（4GB）でした。',
              tags: [
                'Python',
                'Big Data',
                'Machine Learning',
                'Graph Theory',
                'Neo4j',
              ],
            },
          ],
        },
        {
          year: 2016,
          works: [
            {
              title: 'Onbu',
              imagePath: '/images/onbu.jpg',
              charge: 'ハッカソン',
              description: '「KITハッカソン vol.4」にて、小学生が自治的にケンカを仲裁するためのシステムをつくりました。<br>' +
              '審査員（小学生）賞を受賞しました。副賞はありませんでした。<br>' +
              '<a href="http://www.huffingtonpost.jp/2016/04/11/kit-hackathon_n_9631618.html" target="_blank">' +
              '近未来の小学校を創造せよ 〜金沢工業大学の「ハッカソン×地域密着」が示す、巻き込み型のまちづくり</a>',
              tags: [
                'IoT',
                'Ruby',
                'Ruby on Rails',
                'Raspberry Pi',
                'HTML',
                'Bootstrap3',
                'MySQL',
              ],
            },
          ],
        },
        {
          year: 2015,
          works: [
            {
              title: 'どっち派論争',
              imagePath: '/images/docchiha_ronsou.png',
              charge: 'ハッカソン',
              description: '「DMMハッカソン」にて、２つの派閥に分かれて口喧嘩するWebアプリをつくりました。<br>' +
              '3位入賞、そしてMVP賞を受賞しました。副賞はいっぱい貰えました。<br>' +
              '<a href="https://www.jobweb.jp/blog/student/2049689/18992" target="_blank">' +
              'DMMハッカソンDAY3 最終日レポート その４</a>',
              tags: [
                'PHP',
                'HTML',
                'Bootstrap3',
                'MySQL',
                'Apache',
                'CentOS',
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
