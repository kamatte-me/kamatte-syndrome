import { Theme } from 'theme-ui';

export const theme: Theme = {
  breakpoints: ['560px', '768px', '1024px'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: `"Hiragino Mincho ProN", "ヒラギノ明朝 Pro W6", "Hiragino Mincho Pro", "BIZ UDPMincho", "Yu Mincho", YuMincho, serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    display: `"Josefin Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    hand: `Caveat, sans-serif`,
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors: {
    text: '#222',
    background: '#fff',
    primary: '#00c69c',
    secondary: '#ff6272',
    white: '#fff',
    black: '#000',
    gray: '#808080',
    lightgray: '#dbdbdb',
    darkgray: '#a0a0a0',
  },
  text: {
    heading: {
      fontFamily: 'body',
      lineHeight: 'heading',
      fontWeight: 'heading',
      color: 'black',
    },
    display: {
      fontFamily: 'display',
      lineHeight: 'heading',
      fontWeight: 'heading',
      color: 'black',
    },
    hand: {
      fontFamily: 'hand',
      lineHeight: 'heading',
      fontWeight: 'heading',
      color: 'black',
    },
  },
  styles: {
    root: {
      position: 'relative',
      minHeight: '100vh',
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1,
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0,
    },
    a: {
      color: 'primary',
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
  },
  layout: {
    blogContainer: {
      variant: 'layout.container',
      maxWidth: '768px',
    },
    youtubeModalContainer: {
      maxWidth: ['100%', '576px', '576px', '768px'],
      maxHeight: '100vh',
      p: 4,
      overflowY: 'auto',
      bg: 'black',
      color: 'white',
    },
  },
  links: {
    nav: {
      variant: 'text.display',
      display: 'block',
      p: 2,
      color: 'black',
      textDecoration: 'none',
      fontSize: 2,
      '&.active, &:hover': {
        color: 'primary',
      },
    },
  },
  badges: {
    primary: {
      color: 'white',
      bg: 'secondary',
      fontFamily: 'display',
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
};
