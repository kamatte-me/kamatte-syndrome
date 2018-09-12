<template>
  <div class="c-youtubeEmbed_videoWrap">
    <div class="c-youtubeEmbed_videoWrap--video">
      <div class="c-youtubeEmbed_videoWrap--video-none" v-if="thumbnailUrl === null"></div>
      <template v-else>
        <button @click.once="play"
                :style="{backgroundImage: `url(${thumbnailUrl})`}"
                v-if="!isPlay">
          <span></span>
        </button>
        <iframe :src="videoEmbedUrl"
                allow="autoplay; encrypted-media"
                frameborder="0" allowfullscreen
                v-else>
        </iframe>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'youtube-embed',
  props: ['videoId'],
  data() {
    return {
      isPlay: false,
      thumbnailUrl: '',
    };
  },
  computed: {
    videoEmbedUrl() {
      return `https://www.youtube.com/embed/${this.videoId}?autoplay=1`;
    },
  },
  methods: {
    play() {
      this.isPlay = true;
    },
  },
  created() {
    // YouTube Data API v3から最高画質のサムネイル取得
    axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        id: this.videoId,
        key: process.env.YOUTUBE_API_KEY,
        fields: 'items(snippet(thumbnails))',
        part: 'snippet',
      },
    }).then((res) => {
      const qualities = ['maxres', 'standard', 'high', 'medium', 'default'];
      for (const quality of qualities) {
        const thumbnail = res.data.items[0].snippet.thumbnails[quality];
        if (thumbnail !== undefined) {
          this.thumbnailUrl = thumbnail.url;
          break;
        }
      }
      if (this.thumbnailUrl === '') {
        this.thumbnailUrl = null;
      }
    }).catch(() => {
      this.thumbnailUrl = null;
    });
  },
};
</script>
