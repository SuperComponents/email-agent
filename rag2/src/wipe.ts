#!/usr/bin/env node

import { VectorStoreManager } from './vector-store.js';
import { CONFIG } from './config.js';
import { createInterface } from 'readline';

async function confirmAction(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const deleteStore = args.includes('--delete-store');
    const vectorStoreId = args.find(arg => arg.startsWith('--vector-store-id='))?.split('=')[1] 
                         || CONFIG.vectorStore.id;

    if (!vectorStoreId) {
      console.error('No vector store ID found. Set VECTOR_STORE_ID in .env or provide --vector-store-id=<id>');
      process.exit(1);
    }

    const manager = new VectorStoreManager(vectorStoreId);
    
    // Get current info
    const info = await manager.getVectorStoreInfo();
    if (!info) {
      console.error('Vector store not found or inaccessible.');
      process.exit(1);
    }

    console.log('Vector Store Info:');
    console.log(`ID: ${info.id}`);
    console.log(`Name: ${info.name}`);
    console.log(`Total files: ${info.file_counts.total}`);
    console.log(`Status: ${info.status}`);

    if (deleteStore) {
      if (!force) {
        const confirmed = await confirmAction(
          `\n⚠️  WARNING: This will PERMANENTLY DELETE the entire vector store "${info.name}".\nThis action cannot be undone.`
        );
        
        if (!confirmed) {
          console.log('Operation cancelled.');
          return;
        }
      }

      console.log('\nDeleting vector store...');
      await manager.deleteVectorStore();
      console.log('✅ Vector store deleted successfully!');
      
    } else {
      if (!force) {
        const confirmed = await confirmAction(
          `\n⚠️  WARNING: This will remove all ${info.file_counts.total} files from the vector store.\nThe store itself will remain but will be empty.`
        );
        
        if (!confirmed) {
          console.log('Operation cancelled.');
          return;
        }
      }

      console.log('\nWiping vector store data...');
      await manager.wipeVectorStore();
      console.log('✅ Vector store wiped successfully!');
      
      // Show updated info
      const updatedInfo = await manager.getVectorStoreInfo();
      if (updatedInfo) {
        console.log('\nUpdated Info:');
        console.log(`Total files: ${updatedInfo.file_counts.total}`);
      }
    }

  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}