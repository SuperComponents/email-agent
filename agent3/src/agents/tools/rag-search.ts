import { Agent, run, fileSearchTool } from '@openai/agents';
// import { getVectorStoreId } from '../../../rag/dist/index';
import { tool } from '@openai/agents';
import { OpenAI } from 'openai';
import { db } from '../../db/db';
// Note: knowledgeBaseArticles table is not available in the new schema
// This tool needs to be refactored or a new knowledge base table needs to be added
import { sql } from 'drizzle-orm';
import { env } from '../../config/environment';

// const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });


export const OPENAI_VECTOR_STORE_KEY = 'emailsmart-knowledge-base';

/* gets the correct vector store by searching for the metadata key that our github sync workflow uses
 * whenever we make changes to the files in the knowledge_base folder. this is the RAG vectore store that
 * our agent should have access to
*/
async function getVectorStore(openai: OpenAI, vectorStoreKey: string = OPENAI_VECTOR_STORE_KEY): Promise<OpenAI.VectorStores.VectorStore> {
  const vectorStores = await openai.vectorStores.list();
  
  const matchingStores = vectorStores.data.filter(
    store => store.metadata?.key === vectorStoreKey
  );
  
  if (matchingStores.length === 0) {
    throw new Error(`No vector store found with metadata key: ${vectorStoreKey}`);
  }
  
  if (matchingStores.length > 1) {
    console.warn(`Warning: Found ${matchingStores.length} vector stores with metadata key: ${vectorStoreKey}. Using the first one.`);
  }

  return matchingStores[0];
}

async function getVectorStoreId(openai: OpenAI, vectorStoreKey: string = OPENAI_VECTOR_STORE_KEY): Promise<string> {
  const vectorStore = await getVectorStore(openai, vectorStoreKey);
  return vectorStore.id;
}

interface RAGSearchParams {
  query: string;
  category?: string;
  limit?: number;
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: env.EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const vectorStoreId = await getVectorStoreId(openai);

const knowledgeBaseSearchTool = fileSearchTool(vectorStoreId, { name: 'search_knowledge_base', includeSearchResults: true });

export const ragSearchTool = knowledgeBaseSearchTool;
