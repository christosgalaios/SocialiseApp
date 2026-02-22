import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  // Frontend (src/) — React + browser globals
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow PascalCase and UPPER_CASE unused vars (components, constants).
      // Also allow `motion` — used as JSX member expression (<motion.div>) which
      // the no-unused-vars rule doesn't recognize as usage.
      'no-unused-vars': ['error', { varsIgnorePattern: '^([A-Z_]|motion$)' }],

      // react-hooks v7 introduced compiler-aware rules that require significant
      // refactoring (e.g. no Date.now()/Math.random() in render, no ref mutation
      // from hooks, no setState in effects). Disable until Phase 2 state refactor.
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },

  // Frontend test files — add Vitest globals
  {
    files: ['src/**/*.test.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        globalThis: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      // Test files commonly import utilities they don't directly reference
      'no-unused-vars': ['error', { varsIgnorePattern: '^([A-Z_]|motion$|expect$)' }],
    },
  },

  // Server — Node.js/CommonJS globals
  {
    files: ['server/**/*.js'],
    ignores: ['server/**/*.test.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // Server test files — ESM + Vitest globals
  {
    files: ['server/**/*.test.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
])
