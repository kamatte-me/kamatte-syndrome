<template>
  <div>
    <template v-if="!isLoading">
      <post-content :post="post"/>
    </template>
    <blog-powered-by/>
  </div>
</template>

<script>
import PostContent from '~/components/PostContent.vue';

export default {
  name: 'slug',
  components: {
    PostContent,
    BlogPoweredBy: () => import('~/components/BlogPoweredBy.vue'),
  },
  data() {
    return {
      post: {},
    };
  },
};
</script>
