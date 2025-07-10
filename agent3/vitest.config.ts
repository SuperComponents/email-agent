import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000, // 30 seconds for API calls
    setupFiles: ['./src/tests/setup.ts'],
    // Run tests sequentially - one file at a time, one test at a time
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    maxConcurrency: 1,
    fileParallelism: false,
  },
});