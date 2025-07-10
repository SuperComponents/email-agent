import { fileSearchTool } from '@openai/agents';
import { OpenAI } from 'openai';

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



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const vectorStoreId = await getVectorStoreId(openai);

const knowledgeBaseSearchTool = fileSearchTool(vectorStoreId, { name: 'search_knowledge_base', includeSearchResults: true });
// const knowledgeBaseSearchTool = fileSearchTool(vectorStoreId, { name: 'search_knowledge_base' });

export const ragSearchTool = knowledgeBaseSearchTool;
