<template>
  <section class="hero is-fullheight is-green">
    <div class="hero-body">
      <div class="container has-text-centered l-error_status">
        <h1 class="title is-1 has-text-primary l-error_status--statusCode">
          {{ error.statusCode }}
        </h1>
        <h2 class="subtitle is-4 has-text-primary l-error_status--message">
          <template v-if="message[error.statusCode] === undefined">
            suman
          </template>
          <template v-else>
            {{ message[error.statusCode] }}
          </template>
        </h2>
        <nuxt-link to="/" class="button is-rounded is-outlined is-primary is-medium">
          TOP
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'error',
  props: ['error'],
  head() {
    return {
      htmlAttrs: {
        class: '',
      },
    };
  },
  data() {
    return {
      message: {
        404: 'This page exists in the future!!!',
      },
    };
  },
};
</script>
