<template>
  <section class="hero is-primary">
    <div class="hero-body">
      <div class="container is-fluid has-text-centered">
        <h1 class="title c-pageHeader_title">{{ $store.state.title }}</h1>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'page-header',
};
</script>

<style scoped>

</style>
