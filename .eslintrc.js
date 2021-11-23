/**
 * @type {import('@typescript-eslint/experimental-utils').TSESLint.Linter.Config}
 */
eslintConfig = {
  extends: ['next', 'prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
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
};

module.exports = eslintConfig;
