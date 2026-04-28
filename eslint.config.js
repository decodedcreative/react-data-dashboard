import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ['.next/**', 'dist/**', 'coverage/**'] },
  ...compat.extends('next/core-web-vitals'),
  eslintConfigPrettier,
];

export default eslintConfig;
