import { config } from 'dotenv';

// Load environment variables once at startup
config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
const openaiApiKey = process.env.OPENAI_API_KEY;
const stackProjectId = process.env.STACK_PROJECT_ID;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Stack Auth project ID is optional - only required if using auth middleware
if (stackProjectId && !stackProjectId.trim()) {
  throw new Error('STACK_PROJECT_ID cannot be empty if provided');
}

export const DATABASE_URL = databaseUrl;
export const OPENAI_API_KEY = openaiApiKey;
export const STACK_PROJECT_ID = stackProjectId;


export const NODE_ENV = process.env.NODE_ENV || 'development';
