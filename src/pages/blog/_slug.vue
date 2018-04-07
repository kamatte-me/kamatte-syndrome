<template>
  <div>
    <post-content :post="post"/>
    <blog-powered-by/>
  </div>
</template>

<script>
import PostContent from '~/components/PostContent.vue';
import { createClient } from '~/plugins/contentful';

export default {
  name: 'slug',
  components: {
    PostContent,
    BlogPoweredBy: () => import('~/components/BlogPoweredBy.vue'),
  },
  head() {
    return {
      meta: [
        { hid: 'description', name: 'description', content: this.post.fields.body },
        { hid: 'og:description', property: 'og:description', content: this.post.fields.body },
        { hid: 'og:type', property: 'og:type', content: 'article' },
      ],
    };
  },
  created() {
    this.$store.commit('updatePageTitle', this.post.fields.title);
  },
  asyncData({ params, error }) {
    const client = createClient();
    return client.getEntries({
      content_type: process.env.CTF_BLOG_POST_TYPE_ID,
      'fields.slug': params.slug,
    }).then((entries) => {
      if (entries.items.length > 0) {
        return {
          post: entries.items[0],
        };
      }
      error({ statusCode: 404 });
      return {};
    });
  },
};
</script>
