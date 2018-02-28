<template>
  <div>
    <page-header/>
    <b-tabs position="is-centered" class="block p-culture_tabs" size="is-medium">
      <b-tab-item v-for="(culturesList, name) in cultures" :key="name" :label="name">
        <div class="container">
          <ul class="p-culture_cultureWrap">
            <li class="column has-text-centered"
                 v-for="culture in culturesList" :key="culture.name">
              <h2 class="title">{{ culture.name }}</h2>
              <youtube-embed :videoId="culture.youtubeVideoId"/>
            </li>
          </ul>
        </div>
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
    YoutubeEmbed: () => import('../components/YoutubeEmbed.vue'),
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
          {
            name: 'Awesome City Club',
            youtubeVideoId: '3M6_LJG7si0',
          },
          {
            name: 'ハナエ',
            youtubeVideoId: 'iYDTN0zMv4w',
          },
          {
            name: 'SHE IS SUMMER',
            youtubeVideoId: 'w13vejFKsFs',
          },
          {
            name: 'ふぇのたす',
            youtubeVideoId: 'Vfav27BDlrs',
          },
          {
            name: '赤い公園',
            youtubeVideoId: 'gQpMiooyBWM',
          },
          {
            name: 'Shiggy Jr.',
            youtubeVideoId: 'gq5DPSPP47g',
          },
          {
            name: 'ヤバイTシャツ屋さん',
            youtubeVideoId: 'J5oytYDMWHA',
          },
          {
            name: 'パスピエ',
            youtubeVideoId: '-DZuJWfPzJE',
          },
          {
            name: 'ポルカドットスティングレイ',
            youtubeVideoId: '3ad4NsEy1tg',
          },
          {
            name: 'フレデリック',
            youtubeVideoId: 'PCp2iXA1uLE',
          },
          {
            name: 'ラブリーサマーちゃん',
            youtubeVideoId: '0HmFe-OicGY',
          },
          {
            name: '泉まくら',
            youtubeVideoId: 'BXs0VuDWp7I',
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
            name: '伊藤万理華',
            youtubeVideoId: 'V_M9uJ75_Zg',
          },
          {
            name: '生ハムと焼うどん',
            youtubeVideoId: 'Uw2XLLPy2EE',
          },
          {
            name: 'バンドじゃないもん！',
            youtubeVideoId: 'wf7dgLoaBCc',
          },
          {
            name: 'Maison book girl',
            youtubeVideoId: 'xuNHdqNbvH4',
          },
          {
            name: '水野しず',
            youtubeVideoId: 'eonSr75DQb0',
          },
          {
            name: 'ベッド・イン',
            youtubeVideoId: 'ahmgp5DyW64',
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
