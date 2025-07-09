import { config } from 'dotenv';

// Load environment variables once at startup
config({ path: '.env' });

const openaiApiKey = process.env.OPENAI_API_KEY;
const vectorStoreId = process.env.VECTOR_STORE_ID;

if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

if (!vectorStoreId) {
  throw new Error('VECTOR_STORE_ID environment variable is required');
}

export const OPENAI_API_KEY = openaiApiKey;
export const VECTOR_STORE_ID = vectorStoreId;
export const NODE_ENV = process.env.NODE_ENV || 'development'; 