import fs from 'fs';
import path from 'path';
import openai from './openai.js';
import { DOCS_PATH } from './env.js';

async function uploadDocsToOpenAI() {
  console.log('📁 Reading docs directory...');
  
  // Get all markdown files from docs directory
  const files = fs.readdirSync(DOCS_PATH).filter(file => file.endsWith('.md'));
  console.log(`Found ${files.length} markdown files`);
  
  const fileIds: string[] = [];
  
  // Upload each file to OpenAI
  for (const filename of files) {
    const filepath = path.join(DOCS_PATH, filename);
    console.log(`📤 Uploading ${filename}...`);
    
    const file = await openai.files.create({
      file: fs.createReadStream(filepath),
      purpose: 'assistants',
    });
    
    fileIds.push(file.id);
    console.log(`✅ Uploaded ${filename} -> ${file.id}`);
  }
  
  console.log(`\n📊 All files uploaded. File IDs:`);
  fileIds.forEach((id, index) => {
    console.log(`  ${files[index]} -> ${id}`);
  });
  
  // Create vector store from uploaded files
  console.log('\n🔄 Creating vector store...');
  const vectorStore = await openai.vectorStores.create({
    name: 'GauntletAIron Support Docs',
    file_ids: fileIds,
  });
  
  console.log(`✅ Vector store created: ${vectorStore.id}`);
  
  // Wait for vector store to be ready
  console.log('⏳ Waiting for vector store to process files...');
  let store = vectorStore;
  while (store.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    store = await openai.vectorStores.retrieve(vectorStore.id);
    console.log(`Status: ${store.status}`);
  }
  
  console.log('\n🎉 Vector store ready!');
  console.log(`Vector Store ID: ${vectorStore.id}`);
  console.log(`File count: ${store.file_counts.total}`);
  
  return {
    vectorStoreId: vectorStore.id,
    fileIds: fileIds,
    fileNames: files,
  };
}

// Export for use in other files
export { uploadDocsToOpenAI };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  uploadDocsToOpenAI()
    .then(result => {
      console.log('\n📋 Summary:');
      console.log(`Vector Store ID: ${result.vectorStoreId}`);
      console.log(`Files uploaded: ${result.fileIds.length}`);
      console.log('File mappings:');
      result.fileNames.forEach((name, index) => {
        console.log(`  ${name} -> ${result.fileIds[index]}`);
      });
    })
    .catch(console.error);
}