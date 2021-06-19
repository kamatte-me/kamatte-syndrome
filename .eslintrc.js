module.exports = {
  globals: {
    __PATH_PREFIX__: true,
  },
  env: {
    browser: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {},
  overrides: [
    {
      files: ['**/*.ts', '**/*tsx'],
      extends: ['next', 'airbnb-typescript', 'plugin:prettier/recommended'],
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['prettier', 'simple-import-sort', 'unused-imports'],
      rules: {
        'react/prop-types': 0,
        'react/destructuring-assignment': 0,
        'react/jsx-pascal-case': 0,
        'react/react-in-jsx-scope': 0,
        'jsx-a11y/anchor-is-valid': 0,
        'react/jsx-filename-extension': [
          1,
          { extensions: ['.js', '.ts', '.tsx', '.jsx'] },
        ],
        'import/prefer-default-export': 0,
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/no-unused-vars': 0,
        'unused-imports/no-unused-imports-ts': 'warn',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
};
