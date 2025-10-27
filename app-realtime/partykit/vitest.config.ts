import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Configuração do Vitest para PartyKit/Cloudflare Workers
 *
 * @see https://vitest.dev/config/
 */

export default defineConfig({
  test: {
    name: 'app-realtime',
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
