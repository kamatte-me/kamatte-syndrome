<template>
  <span>{{ formattedDate }}</span>
</template>

<script>
import moment from 'moment';

export default {
  name: 'date',
  props: ['date'],
  computed: {
    formattedDate() {
      return moment(this.date).format('YYYY/MM/DD');
    },
  },
};
</script>

<style scoped>

</style>
