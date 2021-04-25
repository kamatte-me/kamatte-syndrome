<template>
  <span>{{ formattedDate }}</span>
</template>

<script>
export default {
  name: 'date',
  props: ['date'],
  computed: {
    formattedDate() {
      const date =  new Date(this.date);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    },
  },
};
</script>

<style scoped>

</style>
