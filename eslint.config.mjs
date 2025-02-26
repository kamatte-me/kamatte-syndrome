import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslintReact from '@eslint-react/eslint-plugin';
import nextjs from '@next/eslint-plugin-next';
import vitest from '@vitest/eslint-plugin';
import gitignore from 'eslint-config-flat-gitignore';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import regexpPlugin from 'eslint-plugin-regexp';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
import tsdoc from 'eslint-plugin-tsdoc';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const jsExtensions = 'js,mjs,cjs';
export const jsxExtensions = 'jsx,mjsx';
export const tsExtensions = 'ts,mts,cts';
export const tsxExtensions = 'tsx,mtsx';
export const allJsExtensions = `${jsExtensions},${tsExtensions}`;
export const allJsxExtensions = `${jsxExtensions},${tsxExtensions}`;
export const supportedFileTypes = `**/*{${allJsExtensions},${allJsxExtensions}}`;

export const testsFilePatterns = [
  `**/*.{test,spec}.{${allJsExtensions}}`,
  `**/tests/**/*.{${allJsExtensions}}`,
  `**/__tests__/**/*.{${allJsExtensions}}`,
];

export default tseslint.config(
  {
    name: '@eslint/js',
    files: [supportedFileTypes],
    rules: {
      ...eslint.configs.recommended.rules,
      // best practices
      'array-callback-return': ['error', { allowImplicit: true }],
      'block-scoped-var': 'error',
      curly: ['warn', 'multi-line'],
      'default-case-last': 'error',
      eqeqeq: 'error',
      'grouped-accessor-pairs': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-constructor-return': 'error',
      'no-else-return': 'warn',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': 'error',
      'no-implied-eval': 'error',
      'no-iterator': 'error',
      'no-labels': ['error'],
      'no-lone-blocks': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-param-reassign': 'error',
      'no-proto': 'error',
      'no-return-assign': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'warn',
      'prefer-named-capture-group': 'error',
      'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
      'prefer-regex-literals': 'error',
      yoda: 'warn',
      // possible errors
      'no-console': 'error',
      'no-constant-binary-expression': 'error',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      // es6
      'no-useless-computed-key': 'warn',
      'no-useless-rename': 'warn',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-const': 'warn',
      'prefer-numeric-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'warn',
      'symbol-description': 'error',
      // variables
      'no-label-var': 'error',
      'no-undef-init': 'warn',
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    name: 'jsdoc',
    files: [supportedFileTypes],
    ...jsdoc.configs['flat/recommended'],
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
  },
  {
    name: 'typescript-eslint/strict-type-checked',
    files: [supportedFileTypes],
    extends: tseslint.configs.strictTypeChecked,
  },
  {
    name: 'typescript-eslint rules',
    files: [supportedFileTypes],
    rules: {
      '@typescript-eslint/consistent-type-exports': [
        'warn',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],
      '@typescript-eslint/method-signature-style': 'warn',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: ['PascalCase'],
          selector: ['typeLike', 'enumMember'],
        },
        {
          custom: {
            match: false,
            regex: '^I[A-Z]|^(Interface|Props|State)$',
          },
          format: ['PascalCase'],
          selector: 'interface',
        },
      ],
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-unnecessary-qualifier': 'warn',
      '@typescript-eslint/prefer-regexp-exec': 'warn',
      '@typescript-eslint/require-array-sort-compare': [
        'error',
        { ignoreStringArrays: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: false,
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',
    },
  },
  {
    name: 'for typescript-eslint linting with type',
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: 'tsdoc',
    files: [`**/*.{${tsExtensions},${tsxExtensions}}`],
    plugins: {
      tsdoc,
    },
    rules: {
      'tsdoc/syntax': 2,
    },
  },
  {
    name: 'unicorn',
    files: [supportedFileTypes],
    languageOptions: {
      globals: globals.builtin,
    },
    plugins: { unicorn },
    rules: {
      'unicorn/explicit-length-check': 2,
      'unicorn/consistent-function-scoping': 2,
      'unicorn/prefer-default-parameters': 2,
      'unicorn/no-array-push-push': 2,
      'unicorn/prefer-array-index-of': 2,
      'unicorn/prefer-array-flat-map': 2,
      'unicorn/prefer-array-some': 2,
      'unicorn/prefer-array-find': 2,
      'unicorn/prefer-array-flat': 2,
      'unicorn/prefer-includes': 2,
      'unicorn/prefer-top-level-await': 2,
      'unicorn/prefer-spread': 2,
      'unicorn/no-useless-spread': 2,
      'unicorn/no-useless-fallback-in-spread': 2,
      'unicorn/no-for-loop': 2,
      'unicorn/prefer-set-size': 2,
      'unicorn/prefer-type-error': 2,
      'unicorn/prefer-object-from-entries': 2,
      'unicorn/no-instanceof-array': 2,
      'unicorn/prefer-native-coercion-functions': 2,
      'unicorn/prefer-logical-operator-over-ternary': 2,
      'unicorn/prefer-event-target': 2,
      'unicorn/no-await-expression-member': 2,
      'unicorn/no-new-array': 2,
      'unicorn/throw-new-error': 2,
      'unicorn/no-useless-length-check': 2,
      'unicorn/prefer-prototype-methods': 2,
      'unicorn/prefer-date-now': 2,
      'unicorn/prefer-node-protocol': 2,
      'unicorn/prefer-export-from': [2, { ignoreUsedVariables: true }],
      'unicorn/no-new-buffer': 2,
      'unicorn/prefer-query-selector': 2,
      'unicorn/prefer-string-replace-all': 2,
      'unicorn/prefer-switch': [2, { emptyDefaultCase: 'do-nothing-comment' }],
      'unicorn/switch-case-braces': 2,
      'unicorn/catch-error-name': 2,
      'unicorn/consistent-destructuring': 2,
      'unicorn/prefer-string-slice': 2,
      'unicorn/no-await-in-promise-methods': 2,
      'unicorn/no-single-promise-in-promise-methods': 2,
      'unicorn/consistent-empty-array-spread': 2,
      'unicorn/no-unused-properties': 2,
    },
  },
  {
    name: 'regexp',
    files: [supportedFileTypes],
    plugins: { regexp: regexpPlugin },
    rules: regexpPlugin.configs['flat/recommended'].rules,
  },
  {
    name: 'sonarjs',
    files: [supportedFileTypes],
    plugins: { sonarjs },
    rules: {
      ...sonarjs.configs.recommended.rules,
      'sonarjs/no-nested-template-literals': 'off',
      'sonarjs/cognitive-complexity': 'off',
    },
  },
  {
    name: 'import',
    files: [supportedFileTypes],
    plugins: { import: importX }, // 本来import-xだが、他プラグインとの互換性のためimportに変更
    rules: {
      ...Object.fromEntries(
        Object.entries(importX.flatConfigs.recommended.rules).map(
          ([key, value]) => [key.replace(/^import-x\//, 'import/'), value],
        ),
      ),
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
    settings: {
      // settingsはimport-xのまま
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
  },
  {
    name: 'simple-import-sort',
    files: [supportedFileTypes],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    name: 'd.ts',
    files: ['**/*.d.ts'],
    rules: {
      'import/no-default-export': 0,
    },
  },
  {
    name: 'jsdoc',
    files: [supportedFileTypes],
    plugins: { jsdoc },
    rules: jsdoc.configs['flat/recommended'].rules,
    settings: {
      jsdoc: {
        mode: 'typescript',
      },
    },
  },
  {
    name: 'react',
    files: [supportedFileTypes],
    ...react.configs.flat.recommended,
    rules: {
      ...react.configs.flat.recommended?.rules,
      'react/prop-types': 0,
      'react/no-unstable-nested-components': [2, { allowAsProps: false }],
      'react/jsx-no-useless-fragment': [2, { allowExpressions: true }],
      'react/function-component-definition': [
        2,
        { namedComponents: 'arrow-function' },
      ],
      'react/jsx-boolean-value': 2,
      'react/jsx-fragments': 2,
      'react/jsx-key': [
        2,
        { checkFragmentShorthand: true, warnOnDuplicates: true },
      ],
      'react/hook-use-state': 2,
      'react/destructuring-assignment': 2,
      'react/jsx-filename-extension': [
        2,
        {
          extensions: ['.jsx', '.tsx', '.mtsx', '.mjsx'],
        },
      ],
      'react/no-array-index-key': 2,
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/no-this-in-sfc': 2,
      'react/checked-requires-onchange-or-readonly': 2,
      'react/jsx-sort-props': [
        2,
        {
          callbacksLast: true,
          shorthandFirst: true,
          shorthandLast: false,
          ignoreCase: true,
          noSortAlphabetically: true,
          multiline: 'last',
          reservedFirst: false,
        },
      ],
      'react/no-unknown-property': [
        'error',
        {
          ignore: ['sx'],
        },
      ],
    },
  },
  {
    name: 'react/jsx-runtime',
    files: [`**/*.{${allJsxExtensions}}`],
    ...react.configs.flat['jsx-runtime'],
  },
  {
    name: 'for react/jsx-runtime settings',
    settings: {
      react: {
        version: 'detect',
      },
      linkComponents: ['Link'],
    },
  },
  {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- eslint-plugin-react is not type-safe */
    name: 'react-hooks',
    files: [supportedFileTypes],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
    /* eslint-enable -- eslint-plugin-react is not type-safe */
  },
  {
    files: [supportedFileTypes],
    ...eslintReact.configs['recommended-type-checked'],
  },
  {
    files: [`**/*{${allJsxExtensions}}`],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: [`**/*{${allJsExtensions}}`],
    ...reactRefresh.configs.recommended,
  },
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- @next/eslint-plugin-next is not typed */
  {
    name: 'nextjs',
    files: [`**/*.{${allJsExtensions},${allJsxExtensions}}`],
    plugins: {
      '@next/next': nextjs,
    },
    rules: {
      ...nextjs.configs.recommended.rules,
      ...nextjs.configs['core-web-vitals'].rules,
    },
  },
  /* eslint-enable -- @next/eslint-plugin-next is not typed */
  {
    name: 'react-refresh',
    files: [
      `**/page.{${allJsExtensions},${allJsxExtensions}}`,
      `**/layout.{${allJsExtensions},${allJsxExtensions}}`,
    ],
    rules: {
      'react-refresh/only-export-components': [
        2,
        { allowExportNames: ['metadata', 'generateMetadata'] },
      ],
    },
  },
  {
    name: 'vitest',
    files: testsFilePatterns,
    ...vitest.configs.recommended,
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/consistent-test-it': [
        'error',
        { fn: 'test', withinDescribe: 'test' },
      ],
      'vitest/no-disabled-tests': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-commented-out-tests': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-duplicate-hooks': 'error',
    },
  },
  {
    name: 'testing-library',
    files: testsFilePatterns,
    ...testingLibrary.configs['flat/react'],
  },
  ...storybook.configs['flat/recommended'],
  ...storybook.configs['flat/csf-strict'],
  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- @eslint-community/eslint-comments is not type-safe */
  {
    name: 'comments',
    ...comments.recommended,
    rules: {
      ...comments.recommended.rules,
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },
  /* eslint-enable -- @eslint-community/eslint-comments is not type-safe */
  {
    name: 'config files',
    files: [`**/*.config.{${allJsExtensions}}`],
    rules: {
      'import/no-default-export': 0,
      'import/no-anonymous-default-export': 0,
    },
  },
  {
    name: 'gitignore',
    ...gitignore(),
  },
  {
    name: 'eslint options',
    files: [supportedFileTypes],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
);
