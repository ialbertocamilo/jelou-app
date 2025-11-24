import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import type { Linter } from 'eslint'

export default [
  {
    ignores: ['node_modules/**', 'dist/**', '**/dist/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      'prettier/prettier': ['error']
    }
  }
] as Linter.Config[]
