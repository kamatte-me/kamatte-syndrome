import { base } from '@theme-ui/presets';
import { merge, Theme } from 'theme-ui';

const theme: Theme = merge(base as Theme, {
  colors: {
    text: '#222',
    background: '#fff',
    primary: '#00c69c',
    secondary: '#ff6272',
  },
  fonts: {
    hand: `'Caveat', sans-serif`,
    heading: `'Josefin Sans', sans-serif`,
    body: `Hiragino Mincho ProN, ヒラギノ明朝 Pro W6, Hiragino Mincho Pro, HGS明朝E, Yu Mincho, YuMincho, serif`,
  },
  styles: {
    root: {
      margin: 0,
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
      fontFamily: base.fonts.body,
      fontSize: 2,
      fontWeight: 'bold',
      borderRadius: 2,
      '&.active, &:hover': {
        color: 'primary',
      },
    },
  },
  sizes: {
    container: '1024px',
  },
});

export default theme;
