// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/next-env.d.ts',
      // Marketing app uses Next.js + flat config locally (eslint-config-next).
      // Lint it via `pnpm --filter @qorium/marketing lint`, not from root.
      'apps/marketing/**',
      'infra/docker/data/**',
      // Canonical Cowork-authored configs (read-only per handoff §6)
      'infra/B10-ecosystem.config.js',
      // Browser-context vanilla JS served as static assets by the readybank
      // Express server; parsed in the browser, no Node lint contract applies.
      // If browser-context lint is wanted later, add a per-file globals.browser
      // block instead of removing this ignore.
      'services/readybank/public/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.cjs', '**/*.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
