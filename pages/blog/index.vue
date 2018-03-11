<template>
  <div>
    <section class="section">
      <div class="container">
        <ul class="columns is-centered is-multiline p-blog_list">
          <li class="column is-7" v-for="post in posts" :key="post.sys.id">
            <article class="media">
              <div class="media-left">
                <figure class="image is-96x96">
                  <img
                    :alt="post.fields.title"
                    :src="filledFeaturedImageUrl(post, 100, 100)"
                    :srcset="filledFeaturedImageUrl(post, 100, 100) + ' 1x,'
                           + filledFeaturedImageUrl(post, 200, 200) + ' 2x'"
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
        <div class="columns is-centered is-multiline">
          <div class="column is-7">
            <b-pagination
              class="p-blog_list_pagination"
              :total="totalPosts"
              :current.sync="$store.state.blogCurrentPage"
              order="is-centered"
              :rounded="true"
              :per-page="postPerPage"
              @change="currentPagePosts">
            </b-pagination>
          </div>
        </div>
      </div>
    </section>
    <blog-powered-by/>
  </div>
</template>

<script>
import BlogPoweredBy from '~/components/BlogPoweredBy.vue';
import FormattedDate from '~/components/FormattedDate.vue';
import { createClient } from '~/plugins/contentful';

const client = createClient();
const POST_PER_PAGE = 10;

export default {
  name: 'index',
  components: {
    FormattedDate,
    BlogPoweredBy,
  },
  data() {
    return {
      pageTitle: 'Blog',
      posts: [],
      totalPosts: 0,
      postPerPage: POST_PER_PAGE,
    };
  },
  methods: {
    currentPagePosts(page) {
      client.getEntries({
        content_type: process.env.CTF_BLOG_POST_TYPE_ID,
        order: '-sys.createdAt',
        skip: page - 1,
        limit: POST_PER_PAGE,
      }).then((entries) => {
        this.totalPosts = entries.total;
        this.posts = entries.items;
      });
    },
    filledFeaturedImageUrl(post, width, height) {
      const imageUrl = post.fields.featuredImage.fields.file.url;
      return `${imageUrl}?fit=fill&w=${width}&h=${height}`;
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
    this.currentPagePosts(this.$store.state.blogCurrentPage);
  },
};
</script>
