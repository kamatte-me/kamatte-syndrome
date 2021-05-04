import { base } from '@theme-ui/presets';
import { merge, Theme } from 'theme-ui';

export const theme: Theme = merge(base as Theme, {
  colors: {
    text: '#222',
    background: '#fff',
    primary: '#00c69c',
    secondary: '#ff6272',
  },
  fonts: {
    hand: `Caveat, sans-serif`,
    heading: `"Josefin Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    body: `"Hiragino Mincho ProN", "ヒラギノ明朝 Pro W6", "Hiragino Mincho Pro", "BIZ UDPMincho", "Yu Mincho", YuMincho, serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
  },
  styles: {
    root: {
      position: 'relative',
      minHeight: '100vh',
    },
  },
  links: {
    nav: {
      display: 'block',
      p: 2,
      color: 'black',
      textDecoration: 'none',
      fontFamily: `heading`,
      fontSize: 2,
      fontWeight: 'bold',
      borderRadius: 2,
      '&.active, &:hover': {
        color: 'primary',
      },
    },
  },
  badges: {
    primary: {
      color: 'white',
      bg: 'secondary',
      fontFamily: 'heading',
      paddingTop: '3px',
      px: 2,
    },
  },
  cards: {
    primary: {
      padding: 2,
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  sizes: {
    container: '1024px',
  },
});
