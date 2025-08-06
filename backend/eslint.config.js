// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  // 🧹 Ignora archivos y carpetas innecesarias
  {
    ignores: [
      'admin-dist/',
      'test/*.js',
      '**/*.min.js',
      'start.js',
      'deleteUser.ts',
      'frontend/',
      'dist/',
      'node_modules/'
    ]
  },

  // ✅ Reglas base recomendadas de JavaScript
  js.configs.recommended,

  // ✅ Reglas recomendadas de TypeScript (sin conflictos)
  ...tseslint.configs.recommended,

  // 🎯 Configuración específica para archivos TypeScript
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        alert: 'readonly',
        performance: 'readonly'
      }
    },
    rules: {
      // 🧼 Buenas prácticas
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // se reemplaza por la de TypeScript

      // 🧠 Reglas específicas de TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/triple-slash-reference': 'error'
    }
  }
]
