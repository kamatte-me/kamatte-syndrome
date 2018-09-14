<template>
  <div>
    <section class="section c-blogContent">
      <div class="container">
        <article class="columns is-centered is-multiline">
          <div class="column is-8">
            <div class="block">
              <div>
                <div class="has-text-grey has-text-centered c-blogContent_publishDate">
                  <formatted-date :date="post.fields.date"/>
                </div>
                <aside class="tags has-text-centered c-blogContent_tags"
                     v-if="post.fields.tags">
                  <span class="tag is-green"
                        v-for="(tag, index) in post.fields.tags" :key="index">
                    {{ tag }}
                  </span>
                </aside>
              </div>
            </div>
            <div class="content">
              <div class="c-blogContent_coverImage" v-if="post.fields.featuredImage">
                <img
                  :alt="post.fields.title"
                  :src="post.fields.featuredImage.fields.file.url"/>
              </div>
              <div v-html="compiledPostBody"></div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import marked from 'marked';
import FormattedDate from '~/components/FormattedDate';

export default {
  name: 'post-content',
  props: ['post'],
  components: {
    FormattedDate,
  },
  computed: {
    compiledPostBody() {
      return marked(this.post.fields.body, { breaks: true });
    },
  }
};
</script>
