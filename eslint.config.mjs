import eslint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import eslintReact from '@eslint-react/eslint-plugin';
import nextjs from '@next/eslint-plugin-next';
import vitest from '@vitest/eslint-plugin';
import gitignore from 'eslint-config-flat-gitignore';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import regexpPlugin from 'eslint-plugin-regexp';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjs from 'eslint-plugin-sonarjs';
import storybook from 'eslint-plugin-storybook';
import testingLibrary from 'eslint-plugin-testing-library';
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
    name: 'unicorn',
    files: [supportedFileTypes],
    plugins: { unicorn },
    rules: {
      'unicorn/explicit-length-check': 'error',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-top-level-await': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/prefer-set-size': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/prefer-native-coercion-functions': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'error',
      'unicorn/prefer-event-target': 'error',
      'unicorn/no-await-expression-member': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/prefer-prototype-methods': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-export-from': ['error', { ignoreUsedVariables: true }],
      'unicorn/no-new-buffer': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-switch': [
        'error',
        { emptyDefaultCase: 'do-nothing-comment' },
      ],
      'unicorn/switch-case-braces': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/no-await-in-promise-methods': 'error',
      'unicorn/no-single-promise-in-promise-methods': 'error',
      'unicorn/consistent-empty-array-spread': 'error',
      'unicorn/no-unused-properties': 'error',
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
      'import-x/resolver-next': [createTypeScriptImportResolver()],
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
      'import/no-default-export': 'off',
    },
  },
  {
    name: 'react',
    files: [supportedFileTypes],
    ...react.configs.flat.recommended,
    rules: {
      ...react.configs.flat.recommended?.rules,
      'react/prop-types': 'off',
      'react/no-unstable-nested-components': ['error', { allowAsProps: false }],
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function' },
      ],
      'react/jsx-boolean-value': 'error',
      'react/jsx-fragments': 'error',
      'react/jsx-key': [
        'error',
        { checkFragmentShorthand: true, warnOnDuplicates: true },
      ],
      'react/hook-use-state': 'error',
      'react/destructuring-assignment': 'error',
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.jsx', '.tsx', '.mtsx', '.mjsx'],
        },
      ],
      'react/no-array-index-key': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/no-this-in-sfc': 'error',
      'react/checked-requires-onchange-or-readonly': 'error',
      'react/jsx-sort-props': [
        'error',
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
    name: 'react-hooks',
    files: [supportedFileTypes],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
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
    files: [`**/*{${allJsxExtensions}}`],
    ...reactRefresh.configs.recommended,
  },
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- @next/eslint-plugin-next is not typed */
  {
    name: 'nextjs',
    files: [supportedFileTypes],
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
    name: 'react-refresh for nextjs app router',
    files: [`**/page.{${allJsxExtensions}}`, `**/layout.{${allJsxExtensions}}`],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['metadata', 'generateMetadata'] },
      ],
    },
  },
  {
    name: 'react-refresh for nextjs page router',
    files: [`**/pages/**/*.{${allJsxExtensions}}`],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['getStaticProps', 'getStaticPaths'] },
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
      'vitest/no-standalone-expect': 'error',
      'vitest/no-test-return-statement': 'error',
      'vitest/padding-around-describe-blocks': 'error',
      'vitest/prefer-expect-resolves': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-hooks-on-top': 'error',
      'vitest/prefer-spy-on': 'error',
      'vitest/prefer-to-be': 'error',
      'vitest/prefer-to-contain': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/valid-expect-in-promise': 'error',
    },
  },
  {
    name: 'testing-library',
    files: testsFilePatterns,
    ...testingLibrary.configs['flat/react'],
  },
  ...storybook.configs['flat/recommended'],
  ...storybook.configs['flat/csf-strict'],
  {
    name: 'react-refresh for storybook',
    files: [`**/*.stories.{${allJsExtensions},${allJsxExtensions}}`],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
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
      'import/no-default-export': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    name: 'prettier',
    ...prettier,
  },
  {
    name: 'gitignore',
    ...gitignore(),
  },
  {
    name: 'eslint options',
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
);
