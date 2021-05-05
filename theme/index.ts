import { Theme } from 'theme-ui';

export const theme: Theme = {
  breakpoints: ['560px', '768px', '1024px'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: `"Hiragino Mincho ProN", "ヒラギノ明朝 Pro W6", "Hiragino Mincho Pro", "BIZ UDPMincho", "Yu Mincho", YuMincho, serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    heading: `"Josefin Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans CJK JP", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    hand: `Caveat, sans-serif`,
    monospace: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
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
    gray: '#dbdbdb',
    lightgray: '#f0f0f0',
    darkgray: '#a0a0a0',
  },
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
      color: 'black',
    },
    headingSerif: {
      fontFamily: 'body',
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
      variant: 'text.headingSerif',
      fontSize: 5,
      mt: 5,
      mb: 2,
    },
    h2: {
      variant: 'text.headingSerif',
      fontSize: 4,
      mt: 4,
      mb: 2,
    },
    h3: {
      variant: 'text.headingSerif',
      fontSize: 3,
      mt: 3,
      mb: 2,
    },
    h4: {
      variant: 'text.headingSerif',
      fontSize: 2,
      mt: 2,
      mb: 1,
    },
    h5: {
      variant: 'text.headingSerif',
      fontSize: 1,
      mt: 2,
      mb: 1,
    },
    h6: {
      variant: 'text.headingSerif',
      fontSize: 0,
    },
    a: {
      color: 'primary',
      textDecoration: 'underline',
      opacity: 1,
      transition: 'opacity .2s ease-out',
      ':hover': {
        opacity: 0.7,
      },
    },
    ol: {
      listStyle: 'decimal',
      paddingLeft: '3em',
      my: 2,
    },
    ul: {
      listStyle: 'disc',
      paddingLeft: '3em',
      my: 2,
    },
    blockquote: {
      position: 'relative',
      px: 4,
      py: 3,
      my: 2,
      fontStyle: 'italic',
      bg: 'lightgray',
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      fontSize: 1,
      p: 3,
      my: 2,
      bg: 'lightgray',
      borderRadius: '6px',
      code: {
        color: 'inherit',
        p: 0,
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
      padding: '.2em .5em',
      bg: 'lightgray',
      borderRadius: '6px',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      my: 2,
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
      variant: 'text.heading',
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
};
