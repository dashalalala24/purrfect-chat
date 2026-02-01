import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  { ignores: ['/node_modules', '/dist', '**/*.{js,cjs,mjs}'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts}'],
    plugins: { js, import: importPlugin, 'unused-imports': unusedImports },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        NodeJS: true,
      },
    },
    rules: {
      // import
      'import/no-unresolved': 'off',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
          pathGroups: [{ pattern: 'react', group: 'external', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      'no-unused-vars': 'off',
      // other
      'prefer-const': 'warn',
      // 'no-console': 'warn',
      'no-case-declarations': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'linebreak-style': 'off',
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
      'object-shorthand': 'warn',
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'prefer-promise-reject-errors': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'off',

      // ts
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-array-delete': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      'no-implied-eval': 'off',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-unsafe-unary-minus': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: false,
        },
      ],
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/ban-ts-comment': ['warn', { 'ts-expect-error': false }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-restricted-types': [
        'warn',
        {
          types: {
            Object: {
              message: 'Avoid using the Object type. Did you mean object?',
              fixWith: 'object',
            },
            Function: {
              message: 'Avoid using the Function type. Prefer a specific function type, like () => void.',
              fixWith: '() => void',
            },
            Boolean: {
              message: 'Avoid using the Boolean type. Did you mean boolean?',
              fixWith: 'boolean',
            },
            Number: {
              message: 'Avoid using the Number type. Did you mean number?',
              fixWith: 'number',
            },
            String: {
              message: 'Avoid using the String type. Did you mean string?',
              fixWith: 'string',
            },
            Symbol: {
              message: 'Avoid using the Symbol type. Did you mean symbol?',
              fixWith: 'symbol',
            },
          },
        },
      ],
    },
  },
]);
