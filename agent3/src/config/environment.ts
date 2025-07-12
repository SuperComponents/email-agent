import { config } from 'dotenv';

config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  DATABASE_URL: process.env.DATABASE_URL || '',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || '',
} as const;

// Use TEST_DATABASE_URL when NODE_ENV is test
export const DATABASE_URL = env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL : env.DATABASE_URL;

export const NODE_ENV = env.NODE_ENV;
export const IS_TEST = env.NODE_ENV === 'test';

if (!env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

if (!DATABASE_URL) {
  const requiredVar = env.NODE_ENV === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  throw new Error(`${requiredVar} environment variable is required`);
}
