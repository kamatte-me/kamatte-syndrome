<template>
  <div>
    <template v-if="!isLoading">
      <post-content :post="post"/>
    </template>
    <b-loading :active.sync="isLoading" v-else></b-loading>
    <blog-powered-by/>
  </div>
</template>

<script>
import postQuery from '~/apollo/queries/post';
import PostContent from '~/components/PostContent.vue';

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
  },
};
</script>
