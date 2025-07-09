export const OPENAI_VECTOR_STORE_KEY = 'emailsmart-knowledge-base';
/* gets the correct vector store by searching for the metadata key that our github sync workflow uses
 * whenever we make changes to the files in the knowledge_base folder. this is the RAG vectore store that
 * our agent should have access to
*/
export async function getVectorStore(openai, vectorStoreKey = OPENAI_VECTOR_STORE_KEY) {
    const vectorStores = await openai.vectorStores.list();
    const matchingStores = vectorStores.data.filter(store => store.metadata?.key === vectorStoreKey);
    if (matchingStores.length === 0) {
        throw new Error(`No vector store found with metadata key: ${vectorStoreKey}`);
    }
    if (matchingStores.length > 1) {
        console.warn(`Warning: Found ${matchingStores.length} vector stores with metadata key: ${vectorStoreKey}. Using the first one.`);
    }
    return matchingStores[0];
}
export async function getVectorStoreId(openai, vectorStoreKey = OPENAI_VECTOR_STORE_KEY) {
    const vectorStore = await getVectorStore(openai, vectorStoreKey);
    return vectorStore.id;
}
