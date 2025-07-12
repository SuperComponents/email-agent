import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env file
config();

// Check if .env exists
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Run "make setup" first.');
  process.exit(1);
}

export const CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY?.trim(),
    projectId: process.env.OPENAI_PROJECT_ID?.trim(),
  },
  vectorStore: {
    id: process.env.VECTOR_STORE_ID?.trim(),
  },
  knowledgeBase: {
    path: '../demo-data/knowledge-base',
  },
} as const;

if (!CONFIG.openai.apiKey) {
  console.error('❌ OPENAI_API_KEY is required in .env file');
  console.error('Edit .env and add: OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

console.log('✅ Config loaded successfully');