<template>
  <nav class="navbar is-primary is-fixed-top"
       role="navigation"
       aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link to="/"
                 @click.native="closeDropdown()"
                 class="navbar-item">
        <img src="/logo.png" alt="kamatte syndrome"/>
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
import axios from 'axios';
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
      return this.$store.state.notification.messaging !== null;
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
    /**
     * Firebase Cloud Messagingトークン取得
     */
    getFcmToken() {
      this.$store.state.notification.messaging.getToken()
        .then((currentToken) => {
          if (currentToken) {
            this.$store.commit('notification/setToken', currentToken);
            // トークンの通知登録状況取得
            axios.get(`${process.env.API_HOST}/notification/subscription/${currentToken}`)
              .then((res) => {
                this.$store.commit('notification/setIsSubscribed', res.data.isSubscribed);
              })
              .catch((err) => {})
              .finally(() => {
                this.$store.commit('notification/setIsLoading', false);
              });
          } else {
            this.$store.commit('notification/setIsLoading', false);
          }
        })
        .catch((err) => {
          this.$store.commit('notification/setIsLoading', false);
        });
    },
  },
  beforeMount() {
    if (this.$store.state.notification.messaging === null) {
      this.$store.commit('notification/initMessaging');
    }

    // ブラウザが通知をサポートしていない場合は移行の処理をスキップ
    if (this.$store.state.notification.messaging === null) {
      return;
    }

    // トークン取得
    if (this.$store.state.notification.token === null) {
      this.getFcmToken();
    }

    // トークン更新時のイベント
    this.$store.state.notification.messaging.onTokenRefresh(() => {
      this.getFcmToken();
    });

    /**
     * プッシュ通知取得時
     */
    this.$store.state.notification.messaging.onMessage((payload) => {
      const notification = payload.notification;
      const title = notification.title || 'kamatte syndrome';
      const options = {
        body: notification.body || '何かしらアップデートしますた。',
        icon: notification.icon || '/logo.png',
      };
      const notify = new Notification(title, options);

      // 通知クリック時リンク
      if (notification.click_action !== undefined) {
        const link = notification.click_action;
        notify.addEventListener('click', () => {
          open(link);
        });
      }
    });
  },
};
</script>
