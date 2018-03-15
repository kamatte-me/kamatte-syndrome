<template>
  <div>
    <page-header :title="post.fields.title"/>
    <post-content :post="post"/>
    <blog-powered-by/>
  </div>
</template>

<script>
import PageHeader from '~/components/PageHeader.vue';
import PostContent from '~/components/PostContent.vue';
import { createClient } from '~/plugins/contentful';

export default {
  name: 'slug',
  components: {
    PageHeader,
    PostContent,
    BlogPoweredBy: () => import('~/components/BlogPoweredBy.vue'),
  },
  head() {
    return {
      title: this.post.fields.title,
      meta: [
        { hid: 'og:type', property: 'og:type', content: 'article' },
      ],
    };
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
