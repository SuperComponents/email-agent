#!/usr/bin/env node

import { VectorStoreManager } from './vector-store.js';
import { CONFIG } from './config.js';
import { testOpenAIClient } from './openai-client.js';
import fs from 'fs-extra';
import path from 'path';

async function testDocumentProcessing() {
  console.log('Testing document discovery...');
  
  const knowledgeBasePath = path.resolve(CONFIG.knowledgeBase.path);
  
  if (!await fs.pathExists(knowledgeBasePath)) {
    console.log('❌ Knowledge base directory not found');
    return [];
  }
  
  const manager = new VectorStoreManager();
  const markdownFiles = await manager.findMarkdownFiles(knowledgeBasePath);
  
  console.log(`\n📄 Found ${markdownFiles.length} markdown files:`);
  
  for (const file of markdownFiles.slice(0, 5)) { // Show first 5
    const relativePath = path.relative(knowledgeBasePath, file);
    console.log(`• ${relativePath}`);
  }
  
  if (markdownFiles.length > 5) {
    console.log(`... and ${markdownFiles.length - 5} more files`);
  }
  
  return markdownFiles;
}

async function testVectorStore() {
  console.log('\n\nTesting vector store connection...');
  
  const vectorStoreId = CONFIG.vectorStore.id;
  
  if (!vectorStoreId) {
    console.log('❌ No vector store ID configured. Run upload first.');
    return false;
  }
  
  const manager = new VectorStoreManager(vectorStoreId);
  const info = await manager.getVectorStoreInfo();
  
  if (!info) {
    console.log('❌ Vector store not found or inaccessible.');
    return false;
  }
  
  console.log(`\n📊 Vector Store Status:`);
  console.log(`  ID: ${info.id}`);
  console.log(`  Name: ${info.name}`);
  console.log(`  Status: ${info.status}`);
  console.log(`  Total files: ${info.file_counts.total}`);
  console.log(`  Completed: ${info.file_counts.completed}`);
  console.log(`  In progress: ${info.file_counts.in_progress}`);
  console.log(`  Failed: ${info.file_counts.failed}`);
  
  return info.file_counts.completed > 0;
}

async function testSearch() {
  console.log('\n\nTesting search functionality...');
  
  const vectorStoreId = CONFIG.vectorStore.id;
  
  if (!vectorStoreId) {
    console.log('❌ No vector store ID configured. Cannot test search.');
    return;
  }
  
  const manager = new VectorStoreManager(vectorStoreId);
  
  const testQueries = [
    'How to fix audio problems?',
    'What subscription plans are available?',
    'How to complete a lesson?'
  ];
  
  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);
    
    try {
      const results = await manager.searchDocuments(query, 1);
      
      if (results.length > 0) {
        console.log('✅ Search successful');
        const result = results[0];
        if (result.content.type === 'text') {
          const preview = result.content.text.value.slice(0, 200);
          console.log(`   Preview: ${preview}${preview.length < result.content.text.value.length ? '...' : ''}`);
        }
      } else {
        console.log('⚠️  No results found');
      }
      
    } catch (error) {
      console.log(`❌ Search failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🧪 RAG2 System Test Suite');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Document Discovery
    const files = await testDocumentProcessing();
    
    if (files.length === 0) {
      console.log('❌ No documents found. Check knowledge base path.');
      return;
    }
    
    console.log('✅ Document discovery test passed');
    
    // Test 2: OpenAI Client
    console.log('\n\nTesting OpenAI client...');
    const clientWorks = await testOpenAIClient();
    
    if (!clientWorks) {
      console.log('❌ OpenAI client test failed. Check your API key.');
      return;
    }
    
    console.log('✅ OpenAI client test passed');
    
    // Test 3: Vector Store Connection
    const hasData = await testVectorStore();
    
    if (!hasData) {
      console.log('⚠️  Vector store has no data. Run upload first to test search.');
      return;
    }
    
    console.log('✅ Vector store connection test passed');
    
    // Test 3: Search Functionality
    await testSearch();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}