<template>
  <div>
    <template v-if="isFetchedPost">
      <post-content :post="post"/>
    </template>
    <b-loading :active.sync="isLoading" v-else></b-loading>
    <blog-powered-by/>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import PostContent from '../../components/PostContent.vue';

const postQuery = gql`
    query post($slug: String!) {
      post: Post(slug: $slug) {
        id
        slug
        title
        dateAndTime
        coverImage {
          handle
        }
        content
        tags
      }
    }
  `;

export default {
  name: 'slug',
  components: {
    PostContent,
    BlogPoweredBy: () => import('../../components/BlogPoweredBy.vue'),
  },
  data() {
    return {
      loading: 0,
      post: {},
    };
  },
  apollo: {
    $loadingKey: 'loading',
    post: {
      query: postQuery,
      variables() {
        return {
          slug: this.$route.params.slug,
        };
      },
    },
  },
  computed: {
    isLoading() {
      return this.loading > 0;
    },
    isFetchedPost() {
      return Object.keys(this.post).length > 0;
    },
  },
};
</script>
