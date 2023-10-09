/** @type {import('eslint/lib/shared/types').ConfigData} */
module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        '@vercel/style-guide/eslint/node',
        '@vercel/style-guide/eslint/browser',
        '@vercel/style-guide/eslint/typescript',
        '@vercel/style-guide/eslint/react',
        '@vercel/style-guide/eslint/next',
      ].map(require.resolve),
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        React: true,
        JSX: true,
      },
      plugins: ['simple-import-sort', 'unused-imports'],
      rules: {
        'unicorn/filename-case': 'off',
        'react/function-component-definition': [
          'error',
          { namedComponents: 'arrow-function' },
        ],
        'react/jsx-pascal-case': ['error', { allowNamespace: true }],
        'react/no-unknown-property': ['error', { ignore: ['sx'] }],
        '@typescript-eslint/no-unnecessary-condition': [
          'error',
          {
            allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
          },
        ],
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
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.next/'],
};
