import { Theme } from 'theme-ui';

export const theme: Theme = {
  breakpoints: ['576px', '768px', '1024px'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: `"Hiragino Mincho ProN", "ヒラギノ明朝 Pro W6", "Hiragino Mincho Pro", "BIZ UDPMincho", "Yu Mincho", YuMincho, Roboto, serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
    heading: `"Josefin Sans", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Segoe UI", Google Sans, Roboto, Helvetica Neue, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Sans Emoji"`,
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
    body: 1.6,
    heading: 1.125,
  },
  colors: {
    text: '#222',
    background: '#fff',
    primary: '#00c69c',
    secondary: '#ff6272',
    highlight: '#c5f5eb',
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
      mb: 3,
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
      cursor: 'pointer',
      ':hover': {
        opacity: 0.7,
      },
    },
    ol: {
      listStyle: 'decimal',
      paddingLeft: '2em',
      my: 2,
    },
    ul: {
      listStyle: 'disc',
      paddingLeft: '2em',
      my: 2,
    },
    li: {
      'ol, ul': {
        my: 0,
      },
    },
    blockquote: {
      position: 'relative',
      pl: 5,
      pr: 4,
      py: 4,
      my: 2,
      fontStyle: 'italic',
      bg: 'lightgray',
      '::before': {
        display: 'inline-block',
        position: 'absolute',
        top: 3,
        left: 3,
        content: `url('data:image/svg+xml;utf-8,<svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" viewBox="0 0 16 18" height="36" width="36" xmlns="http://www.w3.org/2000/svg"><path d="M3.516 7c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5l-0.016-0.5c0-3.866 3.134-7 7-7v2c-1.336 0-2.591 0.52-3.536 1.464-0.182 0.182-0.348 0.375-0.497 0.578 0.179-0.028 0.362-0.043 0.548-0.043zM12.516 7c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5l-0.016-0.5c0-3.866 3.134-7 7-7v2c-1.336 0-2.591 0.52-3.536 1.464-0.182 0.182-0.348 0.375-0.497 0.578 0.179-0.028 0.362-0.043 0.549-0.043z" /></svg>')`,
        opacity: 0.15,
      },
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
      padding: '.2em .4em',
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
    narrowContainer: {
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
  buttons: {
    primary: {
      bg: 'primary',
      color: 'white',
      '&:hover': {
        bg: 'text',
      },
    },
    secondary: {
      variant: 'buttons.primary',
      bg: 'secondary',
    },
  },
  links: {
    nav: {
      variant: 'text.heading',
      display: 'block',
      p: 2,
      color: 'black',
      textDecoration: 'none',
      fontSize: [4, 2],
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
  messages: {
    primary: {
      position: 'relative',
      bg: 'primary',
      color: 'white',
      border: 'none',
      fontFamily: 'heading',
    },
    error: {
      variant: 'messages.primary',
      bg: 'secondary',
    },
  },
  sizes: {
    container: '1024px',
  },
};
