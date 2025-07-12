import { beforeAll } from 'vitest';

// Global test setup - runs once before all test files
// Increase timeout to 30 seconds for database reset
beforeAll(async () => {
  // Import after environment is set up
  const { _testDbUrl } = await import('../db/db.js');
  const { env, DATABASE_URL } = await import('../config/environment.js');
  const { ensureTestDatabase } = await import('../db/reset-schema.js');

  // Verify TEST_DATABASE_URL is set
  if (!env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set in .env for tests');
  }

  // Verify we're actually using TEST_DATABASE_URL
  if (_testDbUrl !== env.TEST_DATABASE_URL) {
    throw new Error(
      'CRITICAL: Database mismatch!\n' +
        `Expected to use TEST_DATABASE_URL: ${env.TEST_DATABASE_URL}\n` +
        `But actually using: ${_testDbUrl}\n` +
        'This could mean tests are running against the wrong database!',
    );
  }

  // Verify DATABASE_URL from environment.ts matches what db.ts is using
  if (DATABASE_URL !== _testDbUrl) {
    throw new Error(
      'CRITICAL: Database configuration mismatch!\n' +
        `environment.ts DATABASE_URL: ${DATABASE_URL}\n` +
        `db.ts is using: ${_testDbUrl}`,
    );
  }

  // Reset database to fresh state
  await ensureTestDatabase();
});
