<template>
  <nav class="navbar is-primary is-fixed-top"
       role="navigation"
       aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link to="/"
                 @click.native="closeDropdown()"
                 class="navbar-item">
        <img src="~/assets/images/logo.png" alt="kamatte syndrome"/>
      </nuxt-link>
      <div class="c-navbar_menuWrap-mobile">
        <div v-show="isShowNotificationButton" class="navbar-item is-hidden-desktop">
          <notification-button/>
        </div>
        <div class="navbar-burger"
             :class="{'is-active': isDropdown}"
             @click="toggleDropdown()">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </div>
      </div>
    </div>

    <div class="navbar-menu"
         :class="{'is-active': isDropdown}">
      <div class="navbar-start">
        <nuxt-link class="navbar-item c-navbar_item"
           @click.native="toggleDropdown()"
           v-for="(to, pageTitle) in pages"
           :to="to"
           :class="{'is-active': isCurrentPage(to)}"
           :key="pageTitle">
          {{ pageTitle }}
        </nuxt-link>
      </div>
      <div v-show="isShowNotificationButton" class="navbar-end is-hidden-touch">
        <div class="navbar-item">
          <notification-button/>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import NotificationButton from '~/components/NotificationButton';

export default {
  name: 'navbar',
  components: {
    NotificationButton
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
  computed: {
    isShowNotificationButton() {
      return this.$store.getters['notification/isSupported'];
    }
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
