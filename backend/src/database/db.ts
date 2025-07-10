import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from '../config/env.js';
import * as schema from './schema.js';

// Initialize postgres.js (works for local Postgres *and* Neon's normal SQL endpoint)
const client = postgres(DATABASE_URL, { max: 1 }); // limit connections for serverless
export const db = drizzle(client, { schema });
