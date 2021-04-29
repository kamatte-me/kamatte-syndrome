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
    hand: `"Caveat", sans-serif`,
    heading: `"Josefin Sans", sans-serif`,
    body: `"Hiragino Mincho ProN", "ヒラギノ明朝 Pro W6", "Hiragino Mincho Pro", "HGS明朝E", "Yu Mincho", YuMincho, serif`,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  styles: {
    root: {
      position: 'relative',
      minHeight: '100vh',
    },
    h1: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 5,
    },
    h2: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 4,
    },
    h3: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 3,
    },
    h4: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 2,
    },
    h5: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 1,
    },
    h6: {
      color: 'text',
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      fontSize: 0,
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
  sizes: {
    container: '1024px',
  },
});

export default theme;
