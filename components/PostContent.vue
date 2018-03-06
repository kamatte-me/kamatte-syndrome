<template>
  <div>
    <page-header/>
    <section class="section c-blogContent">
      <div class="container">
        <article class="columns is-centered is-multiline">
          <div class="column is-8">
            <div class="block">
              <div>
                <div class="has-text-grey has-text-centered c-blogContent_publishDate">
                  {{ publishDate(post.dateAndTime) }}
                </div>
                <aside class="tags has-text-centered c-blogContent_tags"
                     v-if="post.tags.length > 0">
                  <span class="tag is-green"
                        v-for="(tag, index) in post.tags" :key="index">
                    {{ tag }}
                  </span>
                </aside>
              </div>
            </div>
            <div class="content">
              <div class="c-blogContent_coverImage" v-if="post.coverImage !== null">
                <img
                  :alt="post.title"
                  :src="`https://media.graphcms.com/${post.coverImage.handle}`"
                />
              </div>
              <vue-markdown>{{ post.content }}</vue-markdown>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import PageHeader from './PageHeader.vue';

export default {
  name: 'post-content',
  props: ['post'],
  components: {
    PageHeader,
    VueMarkdown,
  },
  methods: {
    publishDate(datetime) {
      return moment(datetime).format('YYYY/MM/DD');
    },
  },
  mounted() {
    this.$store.commit('updatePageTitle', this.post.title);
  },
};
</script>
