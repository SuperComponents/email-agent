import { createRequire } from 'node:module';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../config/environment.js';
import { pool } from './db.js';
import * as schema from './schema.js';

const require = createRequire(import.meta.url);
const { pushSchema } = require('drizzle-kit/api') as typeof import('drizzle-kit/api');

export async function resetDatabaseSchema(): Promise<void> {
  // Drop all tables in the public schema
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
  await pool.query('CREATE SCHEMA public');
  await pool.query('GRANT ALL ON SCHEMA public TO public');

  // Push the schema
  await push();
}

async function push() {
  const adminDb = drizzle(pool); // <-- untitled client

  const { warnings, hasDataLoss, apply } = await pushSchema(schema, adminDb);

  if (hasDataLoss) {
    console.warn('⚠️  Potential data-loss operations:\n', warnings.join('\n'));
  }

  await apply();
}

// Utility function for use in test setup
export async function ensureTestDatabase(): Promise<void> {
  if (env.NODE_ENV !== 'test') {
    throw new Error('Database reset is only allowed in test environment');
  }

  if (!env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be set');
  }

  await resetDatabaseSchema();
}
