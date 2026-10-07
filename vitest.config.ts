import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/**/*.test.ts',
      'packages/*/src/**/*.test.ts',
      'packages/*/tests/**/*.test.ts',
      'services/*/src/**/*.test.ts',
      'services/*/tests/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
      'apps/*/tests/**/*.test.ts',
    ],
  },
});
