import packageJsonPlugin from 'prettier-plugin-packagejson';

/** @type {import('prettier').Config} */
const config = {
  endOfLine: 'lf',
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  singleQuote: true,
  plugins: [packageJsonPlugin],
};

export default config;
