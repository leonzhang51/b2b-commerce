//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      'creatDB.ts',
      'prettier.config.js',
      'tailwind.config.js',
      'eslint.config.js',
    ],
  },
  {
    files: ['src/routes/demo.*.tsx', 'src/hooks/demo.*.ts'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'no-shadow': 'warn',
    },
  },
  {
    rules: {
      // Disable pnpm-specific rules since we're using npm
      'pnpm/json-enforce-catalog': 'off',
    },
  },
]
