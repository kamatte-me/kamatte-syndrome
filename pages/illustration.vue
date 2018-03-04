<template>
  <div>
    <page-header/>
    <section class="section">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-vertical" :class="'is-' + columnSize"
               v-for="(illustrationsList, index) in divideIllustrationsList(columns)"
               :key="index"
          >
            <div class="tile is-parent is-vertical">
              <article class="tile is-child"
                       v-for="illustration in illustrationsList"
                       :key="illustration.title"
              >
                <div class="box">
                  <h2 class="title is-4 has-text-centered">{{ illustration.title }}</h2>
                  <figure class="has-text-centered">
                    <img :src="illustration.imagePath"/>
                  </figure>
                </div>
              </article>
            </div>
          </div>
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
      columns: 2,
      illustrations: [
        {
          title: 'ビート板とコマが遊んでいるところ',
          imagePath: '/images/orenoe/bi-to_ban_to_koma.jpg',
        },
        {
          title: '当たり障りない騙し合い',
          imagePath: '/images/orenoe/atarisawari_nai_damashiai.jpg',
        },
        {
          title: 'おばあちゃんの',
          imagePath: '/images/orenoe/obaachan_no.jpg',
        },
        {
          title: 'おでかけ',
          imagePath: '/images/orenoe/odekake.jpg',
        },
      ],
    };
  },
  computed: {
    columnSize() {
      return Math.floor(12 / this.columns);
    },
  },
  methods: {
    divideIllustrationsList(columns) {
      const dividedList = [];
      for (let column = 0; column < columns; column += 1) {
        dividedList.push([]);
      }
      _.each(this.illustrations, (illustration, index) => {
        const column = Math.floor(index % columns);
        dividedList[column].push(illustration);
      });
      return dividedList;
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
