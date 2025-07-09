import { config } from 'dotenv';

// Load environment variables once at startup
config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!openaiApiKey) {
  console.warn('WARNING: OPENAI_API_KEY environment variable is not set. Agent functionality will be limited.');
}

export const DATABASE_URL = databaseUrl;
export const OPENAI_API_KEY = openaiApiKey;
export const NODE_ENV = process.env.NODE_ENV || 'development';
