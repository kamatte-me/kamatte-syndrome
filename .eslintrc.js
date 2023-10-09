/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/next',
  ].map(require.resolve),
  parserOptions: {
    project: './tsconfig.json',
  },
  globals: {
    React: true,
    JSX: true,
  },
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function' },
    ],
    'react/jsx-pascal-case': ['error', { allowNamespace: true }],
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    'import/no-useless-path-segments': 'error',
    'import/no-default-export': 'off',
    'import/order': 'off',
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
  ignorePatterns: ['node_modules/', 'dist/', '.next/'],
};
