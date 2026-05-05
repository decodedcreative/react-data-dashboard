import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'chromatic-archives/**',
    ],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'padding-line-between-statements': [
        'error',
        { blankLine: 'never', prev: 'import', next: 'import' },
      ],
    },
  },
  eslintConfigPrettier,
];

export default eslintConfig;
