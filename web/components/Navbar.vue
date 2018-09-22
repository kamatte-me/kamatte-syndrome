<template>
  <nav class="navbar is-primary is-fixed-top"
       role="navigation"
       aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link
        to="/"
        v-on:click.native="closeDropdown()"
        class="navbar-item">
        <img src="~/assets/images/logo.png" alt="kamatte syndrome"/>
      </nuxt-link>
      <div class="navbar-burger"
           v-bind:class="{'is-active': isDropdown}"
           v-on:click="toggleDropdown()">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="navbar-menu"
         v-bind:class="{'is-active': isDropdown}">
      <div class="navbar-start">
        <nuxt-link class="navbar-item c-navbar_item"
           v-on:click.native="toggleDropdown()"
           v-for="(to, pageTitle) in pages"
           :to="to"
           v-bind:class="{'is-active': isCurrentPage(to)}"
           :key="pageTitle">
          {{ pageTitle }}
        </nuxt-link>
      </div>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <notification></notification>
      </div>
    </div>
  </nav>
</template>

<script>
import Notification from '~/components/Notification';

export default {
  name: 'navbar',
  components: {
    Notification
  },
  data() {
    return {
      pages: {
        Biography: { name: 'biography' },
        Portfolio: { name: 'portfolio' },
        Illustration: { name: 'illustration' },
        Culture: { name: 'culture' },
        Blog: { name: 'blog' },
      },
      isDropdown: false,
    };
  },
  methods: {
    /**
     * ドロップダウンを開閉する
     */
    toggleDropdown() {
      this.isDropdown = !this.isDropdown;
    },
    /**
     * ドロップダウンを閉じる
     */
    closeDropdown() {
      this.isDropdown = false;
    },
    /**
     * 渡されたパスが現在表示しているパスか前方一致で判別する
     * @param to
     * @returns {boolean}
     */
    isCurrentPage(to) {
      return new RegExp(`^${to.name}`).test(this.$route.name);
    },
  },
};
</script>
