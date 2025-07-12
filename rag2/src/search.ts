#!/usr/bin/env node

import { VectorStoreManager } from './vector-store.js';
import { CONFIG } from './config.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('Usage: npm run search "your search query"');
      console.error('Example: npm run search "how to fix audio issues"');
      process.exit(1);
    }

    const query = args.join(' ');
    const vectorStoreId = process.env.VECTOR_STORE_ID || CONFIG.vectorStore.id;

    if (!vectorStoreId) {
      console.error('No vector store ID found. Set VECTOR_STORE_ID in .env or upload documents first.');
      process.exit(1);
    }

    console.log(`Searching for: "${query}"`);
    console.log(`Using vector store: ${vectorStoreId}\n`);

    const manager = new VectorStoreManager(vectorStoreId);
    const results = await manager.searchDocuments(query);

    if (results.length === 0) {
      console.log('No results found.');
      return;
    }

    console.log('Search Results:');
    console.log('='.repeat(50));

    for (const [index, result] of results.entries()) {
      console.log(`\nResult ${index + 1}:`);
      console.log('-'.repeat(30));
      
      if (result.content.type === 'text') {
        console.log(result.content.text.value);
      } else {
        console.log(JSON.stringify(result.content, null, 2));
      }
      
      if (result.metadata) {
        console.log('\nMetadata:');
        console.log(JSON.stringify(result.metadata, null, 2));
      }
    }

  } catch (error) {
    console.error('Search failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}