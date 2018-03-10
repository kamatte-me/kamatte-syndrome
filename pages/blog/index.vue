<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="block">
          <ul class="columns is-centered is-multiline p-blog_list">
            <li class="column is-7" v-for="post in posts" :key="post.sys.id">
              <article class="media">
                <div class="media-left">
                  <figure class="image is-96x96">
                    <img
                      :alt="post.fields.title"
                      :src="croppedCoverImageUrl(post, 100, 100)"
                      :srcset="croppedCoverImageUrl(post, 100, 100) + ' 1x,'
                             + croppedCoverImageUrl(post, 200, 200) + ' 2x'"
                      v-if="post.fields.featuredImage"
                    />
                    <img
                      :alt="post.fields.title"
                      src="/avatar.png"
                      v-else
                    />
                  </figure>
                </div>
                <div class="media-content">
                  <h2 class="p-blog_list_postWrap--title">
                    <nuxt-link :to="{ name: 'blog-slug', params: { slug: post.fields.slug }}">
                      {{ post.fields.title }}
                    </nuxt-link>
                  </h2>
                  <p class="p-blog_list_postWrap--date">
                    <formatted-date :date="post.fields.date"/>
                  </p>
                  <div class="tags p-blog_list_postWrap--tags"
                       v-if="post.fields.tags">
                    <span class="tag is-green"
                          v-for="(tag, index) in post.fields.tags" :key="index">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </div>
        <div class="column has-text-centered">
        </div>
      </div>
    </section>
    <blog-powered-by/>
  </div>
</template>

<script>
import moment from 'moment';
import BlogPoweredBy from '~/components/BlogPoweredBy.vue';
import FormattedDate from '~/components/FormattedDate.vue';
import { createClient } from '~/plugins/contentful';

export default {
  name: 'index',
  components: {
    FormattedDate,
    BlogPoweredBy,
  },
  data() {
    return {
      pageTitle: 'Blog',
    };
  },
  asyncData() {
    const client = createClient();
    return client.getEntries({
      content_type: process.env.CTF_BLOG_POST_TYPE_ID,
      order: '-sys.createdAt',
    }).then(entries => (
      { posts: entries.items }
    )).catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
    });
  },
  methods: {
    croppedCoverImageUrl(post, width, height) {
      const imageUrl = post.fields.featuredImage.fields.file.url;
      return `${imageUrl}?fit=scale&w=${width}&h=${height}`;
    },
    publishDate(date) {
      return moment(date).format('YYYY/M/D');
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
