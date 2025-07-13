import { openai } from '../openai-client';
import type OpenAI from 'openai';

type VectorStore = OpenAI.VectorStores.VectorStore;


export async function getOrCreateVectorStore(key: string): Promise<VectorStore> {
  console.log(`\n🔍 Looking for vector store with key: ${key}`);
  
  // First try to find existing vector store with the key
  const existingStore = await findVectorStoreByKey(key);
  
  if (existingStore) {
    console.log(`  ✅ Found existing vector store: ${existingStore.id}`);
    return existingStore;
  }
  
  console.log(`  ⚠️  No existing vector store found`);
  // Create new vector store if not found
  return await createVectorStore(key);
}

async function findVectorStoreByKey(key: string): Promise<VectorStore | undefined> {
  let vectorStore: VectorStore | undefined;
  let vectorStoresResponse = await openai.vectorStores.list();
  let pageCount = 1;
  
  console.log(`  🔍 Searching through vector stores...`);
  
  do {
    console.log(`    - Checking page ${pageCount}, ${vectorStoresResponse.data.length} stores`);
    
    vectorStore = vectorStoresResponse.data.find(
      (store: VectorStore) => store.metadata?.['key'] === key
    );
    
    if (vectorStore) {
      return vectorStore;
    }
    
    // Check if there's a next page
    if (vectorStoresResponse.hasNextPage()) {
      vectorStoresResponse = await vectorStoresResponse.getNextPage();
      pageCount++;
    } else {
      break;
    }
  } while (true);
  
  console.log(`    - Search complete, vector store not found`);
  return undefined;
}

async function createVectorStore(key: string): Promise<VectorStore> {
  console.log(`  🆕 Creating new vector store with key: ${key}`);
  
  const vectorStore = await openai.vectorStores.create({
    name: `Web Scrape Store - ${key}`,
    metadata: {
      key: key,
      created: new Date().toISOString(),
      type: 'web-scrape'
    }
  });
  
  console.log(`  ✅ Created vector store: ${vectorStore.id}`);
  return vectorStore as VectorStore;
}

export async function getVectorStoreById(vectorStoreId: string): Promise<VectorStore> {
  const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
  return vectorStore as VectorStore;
}