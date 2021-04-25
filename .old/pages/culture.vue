<template>
  <div>
    <b-tabs position="is-centered" class="p-culture_tabs" size="is-medium">
      <b-tab-item v-for="(culturesList, name) in cultures" :key="name" :label="name">
        <div class="container">
          <dl class="p-culture_cultureWrap">
            <div v-for="culture in culturesList" :key="culture.name">
              <dt class="column has-text-centered">
                <h2 class="title is-4">{{ culture.name }}</h2>
              </dt>
              <dd>
                <youtube-embed :videoId="culture.youtubeVideoId"/>
              </dd>
            </div>
          </dl>
        </div>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import YoutubeEmbed from '~/components/YoutubeEmbed';

export default {
  name: 'culture',
  components: {
    YoutubeEmbed,
  },
  beforeCreate() {
    this.$store.commit('updatePageTitle', 'Culture');
  },
  data() {
    return {
      cultures: {
        Music: [
          {
            name: '集団行動',
            youtubeVideoId: 'kcqomAJ17fk',
          },
          {
            name: 'ドアノブロック',
            youtubeVideoId: 'jQGliz3mfL0',
          },
          {
            name: '古都の夕べ',
            youtubeVideoId: 'g-85w1133Hc',
          },
          {
            name: '相対性理論',
            youtubeVideoId: 'nFG4oQE1Et8',
          },
          {
            name: '進行方向別通行区分',
            youtubeVideoId: '_2ShdLz4cz0',
          },
          {
            name: 'クリトリック・リス',
            youtubeVideoId: 'RXjV3bYdE_8',
          },
          {
            name: 'ニガミ17才',
            youtubeVideoId: 'lZJnkNUX6nI',
          },
          {
            name: 'ネクライトーキー',
            youtubeVideoId: 'Aw1Awul1818',
          },
          {
            name: 'Awesome City Club',
            youtubeVideoId: '3M6_LJG7si0',
          },
          {
            name: 'ポップしなないで',
            youtubeVideoId: 'HTlsHDVH-2A',
          },
          {
            name: 'SUKISHA',
            youtubeVideoId: 'KLr9egOEgBw',
          },
          {
            name: 'sympathy',
            youtubeVideoId: '0e4aHM0uKRY',
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
            youtubeVideoId: 'u7Z4YbdEftw',
          },
          {
            name: 'MINT mate box',
            youtubeVideoId: 'WK_q13_SesI',
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
            name: 'フィロソフィーのダンス',
            youtubeVideoId: 'm7SFHf-32nk',
          },
          {
            name: '寺嶋由芙',
            youtubeVideoId: 'MrW1nfC4r_U',
          },
          {
            name: 'ゆるめるモ！',
            youtubeVideoId: 'M1EXYQvAIvw',
          },
          {
            name: 'まねきケチャ',
            youtubeVideoId: 'I1oEf1hGsfA',
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
            name: '伊藤万理華',
            youtubeVideoId: 'V_M9uJ75_Zg',
          },
          {
            name: '生ハムと焼うどん',
            youtubeVideoId: 'Uw2XLLPy2EE',
          },
          {
            name: 'ベッド・イン',
            youtubeVideoId: 'ahmgp5DyW64',
          },
          {
            name: '水野しず',
            youtubeVideoId: 'eonSr75DQb0',
          },
        ],
      },
    };
  },
};
</script>
