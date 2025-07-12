#!/usr/bin/env node

import { VectorStoreManager } from './vector-store.js';
import { CONFIG } from './config.js';

async function main() {
  try {
    const args = process.argv.slice(2);
    const createNew = args.includes('--create-new');
    const vectorStoreId = args.find(arg => arg.startsWith('--vector-store-id='))?.split('=')[1];

    let manager: VectorStoreManager;

    if (createNew) {
      console.log('Creating new vector store...');
      manager = new VectorStoreManager();
      const newVectorStoreId = await manager.createVectorStore('Knowledge Base - ' + new Date().toISOString());
      console.log(`\nIMPORTANT: Add this to your .env file:`);
      console.log(`VECTOR_STORE_ID=${newVectorStoreId}\n`);
    } else if (vectorStoreId) {
      manager = new VectorStoreManager(vectorStoreId);
    } else if (CONFIG.vectorStore.id) {
      manager = new VectorStoreManager(CONFIG.vectorStore.id);
    } else {
      console.error('No vector store ID provided. Use --create-new to create a new one, or set VECTOR_STORE_ID in .env');
      process.exit(1);
    }

    console.log('Starting document upload...');
    await manager.uploadDocuments();
    
    const info = await manager.getVectorStoreInfo();
    if (info) {
      console.log('\nVector Store Info:');
      console.log(`ID: ${info.id}`);
      console.log(`Name: ${info.name}`);
      console.log(`Status: ${info.status}`);
      console.log(`Total files: ${info.file_counts.total}`);
      console.log(`Completed: ${info.file_counts.completed}`);
      console.log(`In progress: ${info.file_counts.in_progress}`);
      console.log(`Failed: ${info.file_counts.failed}`);
    }

  } catch (error) {
    console.error('Upload failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}