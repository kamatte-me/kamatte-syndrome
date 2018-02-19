<template>
  <div>
    <page-header/>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-two-fifths has-text-centered">
            <img src="/avatar.png" alt="kamatte" width="300" height="300"/>
          </div>
          <div class="column">
            <h2 class="title is-1 p-biography_profile_name">kamatte</h2>
            <dl class="p-biography_profile_chronology">
              <template v-for="(event, year) in chronology">
                <dt :key="year">{{ year }}年</dt>
                <dd :key="event">{{ event }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'biography',
  components: {
    PageHeader,
  },
  data() {
    return {
      title: 'Biography',
      chronology: {
        1994: '富山生まれ。',
        2012: '金沢に移住。',
        2013: '三代目IT革命児になる。',
        2014: '20歳になる。',
        2016: 'Web蜃気楼になる。',
        2017: '妖精の国に移住。6さいになる。',
      },
    };
  },
  created() {
    this.$store.commit('updateTitle', this.title);
  },
};
</script>
