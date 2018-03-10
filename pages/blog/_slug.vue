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
      // TODO: レンダリング前に404リダイレクトするIssueあり。 https://github.com/nuxt-community/apollo-module/issues/42
      result({ data }) {
        if (!data.post) {
          this.$router.push('/404');
        }
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
