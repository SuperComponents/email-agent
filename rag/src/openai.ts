import { OpenAI } from 'openai';
import { OPENAI_API_KEY, OPENAI_VECTOR_STORE_KEY } from './env.js';

const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
});

/* gets the correct vector store by searching for the metadata key that our github sync workflow uses
 * whenever we make changes to the files in the knowledge_base folder. this is the RAG vectore store that
 * our agent should have access to
*/
async function getVectorStore(): Promise<OpenAI.VectorStores.VectorStore> {
  const vectorStores = await openai.vectorStores.list();
  
  const matchingStores = vectorStores.data.filter(
    store => store.metadata?.key === OPENAI_VECTOR_STORE_KEY
  );
  
  if (matchingStores.length === 0) {
    throw new Error(`No vector store found with metadata key: ${OPENAI_VECTOR_STORE_KEY}`);
  }
  
  if (matchingStores.length > 1) {
    console.warn(`Warning: Found ${matchingStores.length} vector stores with metadata key: ${OPENAI_VECTOR_STORE_KEY}. Using the first one.`);
  }

  return matchingStores[0];
}

export async function getVectorStoreId(): Promise<string> {
  const vectorStore = await getVectorStore();
  return vectorStore.id;
}

export default openai;