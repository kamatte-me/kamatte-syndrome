<template>
  <div>
    <page-header/>
    <section v-if="allPosts.length > 0" class="section">
      <div class="container">
        <div class="block">
          <ul class="columns is-centered is-multiline p-blog_list">
            <li class="column is-7" v-for="post in allPosts" :key="post.id">
              <article class="media">
                <div class="media-left">
                  <figure class="image is-96x96">
                    <img
                      :alt="post.title"
                      src="/avatar.png"
                      v-if="post.coverImage === null"
                    />
                    <img
                      :alt="post.title"
                      :src="`https://media.graphcms.com/resize=w:100,h:100,fit:crop/${post.coverImage.handle}`"
                      v-else
                    />
                  </figure>
                </div>
                <div class="media-content">
                  <div>

                  </div>
                  <h2 class="p-blog_list_postWrap--title">
                    <nuxt-link :to="`/blog/${post.slug}`">
                      {{ post.title }}
                    </nuxt-link>
                  </h2>
                  <p class="p-blog_list_postWrap--date">
                    {{ formattedDatetime(post.dateAndTime) }}
                  </p>
                  <div class="tags p-blog_list_postWrap--tags"
                       v-if="post.tags.length > 0">
                    <span class="tag is-green"
                          v-for="(tag, index) in post.tags" :key="index">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </article>
            </li>
          </ul>
        </div>
        <div class="column has-text-centered">
          <button
            v-if="postCount && postCount > allPosts.length"
            class="button is-rounded is-outlined is-primary is-medium"
            :class="{ 'is-loading': loading }"
            @click="loadMorePosts">
            More!!!
          </button>
        </div>
      </div>
    </section>
    <h2 v-else>
      Loading...
    </h2>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import moment from 'moment';
import PageHeader from '../../components/PageHeader.vue';

const POSTS_PER_PAGE = 1;
const allPostsQuery = gql`
    query allPosts($first: Int!, $skip: Int!) {
      allPosts(orderBy: dateAndTime_DESC, first: $first, skip: $skip) {
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
  name: 'index',
  components: {
    PageHeader,
  },
  data() {
    return {
      pageTitle: 'Blog',
      allPosts: [],
      postCount: 0,
    };
  },
  apollo: {
    $loadingKey: 'loading',
    allPosts: {
      query: allPostsQuery,
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
    formattedDatetime(datetime) {
      return moment(datetime).format('YYYY/M/D');
    },
  },
  created() {
    this.$store.commit('updatePageTitle', this.pageTitle);
  },
};
</script>
