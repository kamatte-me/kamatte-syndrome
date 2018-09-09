<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="columns">
          <div class="column is-two-fifths has-text-centered">
            <img src="/avatar.png" alt="kamatte" width="300" height="300"/>
          </div>
          <div class="column">
            <div class="has-text-centered-mobile has-text-green p-biography_profile_name">
              kamatte
            </div>
            <div class="block has-text-centered-mobile">
              <a href="https://github.com/kamatte-me" target="_blank">
                <i class="fab fa-github fa-2x has-text-github"></i>
              </a>
            </div>
            <dl class="p-biography_profile_chronology is-clearfix">
              <template v-for="(event, year) in chronology">
                <dt :key="year">{{ year }}年</dt>
                <dd :key="event">{{ event }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </div>
    </section>
    <section class="section p-biography_skills">
      <h2 class="title has-text-centered p-biography_skills_title">Skills</h2>
      <div class="container">
        <ul>
          <li class="columns" v-for="(level, skill) in skills" :key="skill">
            <div class="column is-one-third">
              <h3 class="title is-4 has-text-right-desktop p-biography_skills_skill"
                  :class="{'has-text-primary' : isHighLevel(level)}">
                {{ skill }}
              </h3>
            </div>
            <div class="column p-biography_skills_level">
              <progress class="progress"
                        :class="[isHighLevel(level) ? 'is-primary' : 'is-green']"
                        :value="level"
                        max="100">
                Lv. {{ level }}
              </progress>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'biography',
  head() {
    return {
      meta: [
        { hid: 'og:type', property: 'og:type', content: 'profile' },
      ],
    };
  },
  beforeCreate() {
    this.$store.commit('updatePageTitle', 'Biography');
  },
  data() {
    return {
      chronology: {
        1994: '富山生まれ',
        2012: '金沢に移住',
        2013: 'IT革命児になる',
        2014: '20歳になる',
        2016: 'Web蜃気楼になる',
        2017: '妖精の国に移住　6さいになる',
      },
      skills: {
        Python: 100,
        'Ruby(Ruby on Rails)': 80,
        JavaScript: 75,
        jQuery: 80,
        'Vue.js(Nuxt.js)': 90,
        React: 55,
        Angular: 30,
        Golang: 60,
        Java: 85,
        Scala: 40,
        PHP: 80,
        C: 20,
        'C++': 40,
        'C#': 20,
        'Objective-C': 55,
        'Android Java': 70,
        R: 10,
        HTML: 75,
        'CSS/SCSS': 65,
        MySQL: 75,
        MongoDB: 30,
        Neo4j: 70,
        Realm: 65,
        Nginx: 70,
        Git: 90,
        Vagrant: 65,
        Docker: 20,
        Ansible: 70,
        'Circle CI': 50,
        Jenkins: 30,
        Zabbix: 80,
        'Linux(Ubuntu/CentOS)': 80,
        AWS: 45,
        GCP: 50,
        'Graph Theory': 75,
        'Machine Learning/Big Data': 70,
        Photoshop: 40,
        Illustrator: 20,
        kawaii: 100,
      },
    };
  },
  methods: {
    isHighLevel(level) {
      return level >= 70;
    },
  },
};
</script>
