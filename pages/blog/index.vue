<template>
  <div>
    <page-header/>
    {{ allPosts }}
    <section v-if="allPosts.length > 0" class="section">
      <ul>
        <li v-for="post in allPosts" :key="post.id">
          <nuxt-link :to="`/blog/${post.slug}`">
            <div>
              <img
                v-if="post.coverImage !== null"
                :alt="post.title"
                :src="`https://media.graphcms.com/resize=w:100,h:100,fit:crop/${post.coverImage.handle}`"
              />
            </div>
            <h3>{{post.title}}</h3>
          </nuxt-link>
        </li>
      </ul>
      <button v-if="postCount && postCount > allPosts.length" @click="loadMorePosts">
        {{loading ? 'Loading...' : 'Show more'}}
      </button>
    </section>
    <h2 v-else>
      Loading...
    </h2>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import PageHeader from '../../components/PageHeader.vue';

const POSTS_PER_PAGE = 2;
const allPosts = gql`
    query allPosts($first: Int!, $skip: Int!) {
      allPosts(orderBy: dateAndTime_DESC, first: $first, skip: $skip) {
        id
        slug
        title
        dateAndTime
        coverImage {
          handle
        }
      }
    }
  `;

export default {
  name: 'index',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Blog',
      loading: 0,
      allPosts: [],
      postCount: 0,
    };
  },
  apollo: {
    $loadingKey: 'loading',
    allPosts: {
      query: allPosts,
      variables: {
        skip: 0,
        first: POSTS_PER_PAGE,
      },
    },
    postCount: {
      query: gql`{ _allPostsMeta { count } }`,
      update: ({ _allPostsMeta }) => _allPostsMeta.count,
    },
  },
  methods: {
    loadMorePosts() {
      this.$apollo.queries.allPosts.fetchMore({
        variables: {
          skip: this.allPosts.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          return Object.assign({}, previousResult, {
            allPosts: [...previousResult.allPosts, ...fetchMoreResult.allPosts],
          });
        },
      });
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
