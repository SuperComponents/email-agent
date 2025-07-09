import pg from 'pg';
import { PG_URL } from './env.js';

// Create the database pool
const db = new pg.Pool({ connectionString: PG_URL });

// Initialize the vector extension
await db.query('CREATE EXTENSION IF NOT EXISTS vector;');

export default db;
