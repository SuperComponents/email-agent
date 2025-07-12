#!/usr/bin/env tsx
import { config } from 'dotenv';

// Load environment variables from .env
config();

import { _testDbUrl } from '../db/db.js';
import { env, DATABASE_URL } from '../config/environment.js';
import { ensureTestDatabase } from '../db/reset-schema.js';

async function resetTestDb() {
  // Verify TEST_DATABASE_URL is set
  if (!env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set in .env');
  }

  // Verify we're actually using TEST_DATABASE_URL
  if (_testDbUrl !== env.TEST_DATABASE_URL) {
    throw new Error(
      'CRITICAL: Database mismatch!\n' +
        `Expected to use TEST_DATABASE_URL: ${env.TEST_DATABASE_URL}\n` +
        `But actually using: ${_testDbUrl}\n` +
        "This could mean we're not using the test database!",
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
  try {
    await ensureTestDatabase();
    console.log('✅ Test database reset complete');
  } catch (error) {
    console.error('\n❌ Failed to reset test database:', error);
    throw error;
  }
}

// Run the reset
void resetTestDb();
