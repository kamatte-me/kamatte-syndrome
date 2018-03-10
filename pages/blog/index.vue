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
        <div class="column has-text-centered" v-if="isMorePosts">
          <button
            class="button is-rounded is-outlined is-primary is-medium"
            @click="loadMorePosts">
            More!!!
          </button>
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
const POST_PER_PAGE = 1;

export default {
  name: 'index',
  components: {
    FormattedDate,
    BlogPoweredBy,
  },
  data() {
    return {
      pageTitle: 'Blog',
      page: 0,
      totalPosts: 0,
    };
  },
  asyncData() {
    return client.getEntries({
      content_type: process.env.CTF_BLOG_POST_TYPE_ID,
      order: '-sys.createdAt',
      skip: 0,
      limit: POST_PER_PAGE,
    }).then(entries => (
      {
        posts: entries.items,
        totalPosts: entries.total,
      }
    ));
  },
  methods: {
    loadMorePosts() {
      const self = this;
      self.page += 1;
      return client.getEntries({
        content_type: process.env.CTF_BLOG_POST_TYPE_ID,
        order: '-sys.createdAt',
        skip: self.page,
        limit: POST_PER_PAGE,
      }).then((entries) => {
        if (entries.items.length > 0) {
          self.totalPosts = entries.total;
          self.posts = self.posts.concat(entries.items);
        }
        // eslint-disable-next-line no-console
        console.log(entries);
      });
    },
    croppedCoverImageUrl(post, width, height) {
      const imageUrl = post.fields.featuredImage.fields.file.url;
      return `${imageUrl}?fit=fill&w=${width}&h=${height}`;
    },
  },
  computed: {
    isMorePosts() {
      return (this.page + 1) * POST_PER_PAGE < this.totalPosts;
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
