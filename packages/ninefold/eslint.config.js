import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'storybook-static', '.cloudflare', '**/*.timestamp-*', '!.storybook']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        caughtErrors: 'none',
      }],
    },
  },
  {
    // Library entry points, hooks, stories and tests export more than components
    files: ['src/index.ts', 'src/motion.ts', 'src/kit.ts', 'src/hooks/**', 'src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}', 'src/test/**', '.storybook/**', 'src/provider/**', 'src/fx/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
