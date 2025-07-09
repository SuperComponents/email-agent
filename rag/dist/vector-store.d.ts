import type { OpenAI } from 'openai';
export declare const OPENAI_VECTOR_STORE_KEY = "emailsmart-knowledge-base";
export declare function getVectorStore(openai: OpenAI, vectorStoreKey?: string): Promise<OpenAI.VectorStores.VectorStore>;
export declare function getVectorStoreId(openai: OpenAI, vectorStoreKey?: string): Promise<string>;
//# sourceMappingURL=vector-store.d.ts.map