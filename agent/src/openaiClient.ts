import { OpenAI } from 'openai';
import { fileSearchTool, setDefaultOpenAIKey } from '@openai/agents';
import { OPENAI_API_KEY, VECTOR_STORE_ID } from './env';

// Set the default OpenAI API key for the agents library
setDefaultOpenAIKey(OPENAI_API_KEY);

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Create the knowledge base search tool using the vector store ID
export const knowledgeBaseSearchTool = fileSearchTool(VECTOR_STORE_ID);

console.log(`[OpenAI-Client] Initialized with vector store ID: ${VECTOR_STORE_ID}`);
console.log(`[OpenAI-Client] Knowledge base search tool created successfully`);
