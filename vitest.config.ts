import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    include: ['src/test/**/*.{test,spec}.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/app/actions/**/*.ts', 'src/lib/**/*.ts', 'src/proxy.ts'],
      exclude: [
        '**/*.test.ts',
        'src/lib/prisma.ts',
        'src/lib/uploadthing*.ts',
        'src/components/**',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
