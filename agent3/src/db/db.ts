import { drizzle } from 'drizzle-orm/node-postgres';
// import { drizzle } from 'drizzle-orm/postgres-js';
import { Pool } from 'pg';
import { DATABASE_URL } from '../config/environment.js';
import * as schema from './schema.js';

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Export for testing purposes
export const _testDbUrl = DATABASE_URL;

// import postgres from 'postgres';
// import { DATABASE_URL } from '../config/env.js';
// import * as schema from './schema.js';
//
// // Initialize postgres.js (works for local Postgres *and* Neon's normal SQL endpoint)
// const client = postgres(DATABASE_URL, { max: 1 }); // limit connections for serverless
// export const db = drizzle(client, { schema });
