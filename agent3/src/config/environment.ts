import { config } from 'dotenv';

config();

export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  DATABASE_URL: process.env.DATABASE_URL || '',
} as const;

export const DATABASE_URL = env.DATABASE_URL;

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}