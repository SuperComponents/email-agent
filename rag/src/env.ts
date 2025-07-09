import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const PG_URL = 'postgresql://localhost:5432/emailsmart_rag';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const SUPPORT_DOCS_TABLE = 'support_docs';
export const DOCS_PATH = 'knowledge_base';
// export const OPENAI_VECTOR_STORE_KEY = 'emailsmart-knowledge-base';
