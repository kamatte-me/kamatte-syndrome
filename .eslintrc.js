module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'airbnb',
        'airbnb-typescript',
        'next',
        'plugin:prettier/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['simple-import-sort', 'unused-imports'],
      rules: {
        'consistent-return': 0,
        'import/prefer-default-export': 0,
        'react/function-component-definition': 0,
        'react/jsx-pascal-case': 0,
        'react/require-default-props': 0,
        'react/destructuring-assignment': 0,
        'jsx-a11y/click-events-have-key-events': 0,
        'jsx-a11y/no-noninteractive-element-interactions': 0,
        'react/jsx-no-useless-fragment': 0,
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
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
