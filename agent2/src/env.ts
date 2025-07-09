import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Export environment variables with proper error handling
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_VECTOR_STORE_KEY = process.env.OPENAI_VECTOR_STORE_KEY;

// Validate required environment variables
if (!OPENAI_API_KEY) {
    console.warn('[ENV] OPENAI_API_KEY not found in environment variables');
}

if (!OPENAI_VECTOR_STORE_KEY) {
    console.warn('[ENV] OPENAI_VECTOR_STORE_KEY not found in environment variables');
}

console.log(`[ENV] Environment variables loaded - API Key: ${OPENAI_API_KEY ? '✓' : '✗'}, Vector Store Key: ${OPENAI_VECTOR_STORE_KEY ? '✓' : '✗'}`); 