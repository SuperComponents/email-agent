import OpenAI from 'openai';
import { getVectorStoreId } from '../src/vector-store';
import { OPENAI_API_KEY } from '../src/env';

async function listVectorDbFiles() {
  if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  try {
    // Get the vector store ID
    const vectorStoreId = await getVectorStoreId(openai);
    console.log(`Vector Store ID: ${vectorStoreId}\n`);

    // Get the vector store details
    const vectorStore = await openai.vectorStores.retrieve(vectorStoreId);
    console.log(`Vector Store Name: ${vectorStore.name}`);
    console.log(`Total Files: ${vectorStore.file_counts.total}`);
    console.log(`Status: ${vectorStore.status}`);
    console.log(`Created: ${new Date(vectorStore.created_at * 1000).toLocaleString()}\n`);
    
    // List all files in the vector store
    const files = await openai.vectorStores.files.list(vectorStoreId);
    
    console.log('Files in Vector Database:');
    console.log('========================\n');
    
    let fileCount = 0;
    for await (const file of files) {
      fileCount++;
      console.log(`${fileCount}. File ID: ${file.id}`);
      console.log(`   Status: ${file.status}`);
      console.log(`   Created: ${new Date(file.created_at * 1000).toLocaleString()}`);
      
      // Get more details about the file
      try {
        const fileDetails = await openai.files.retrieve(file.id);
        console.log(`   Filename: ${fileDetails.filename}`);
        console.log(`   Size: ${fileDetails.bytes} bytes`);
        console.log(`   Purpose: ${fileDetails.purpose}`);
      } catch (error) {
        console.log(`   (Could not retrieve file details)`);
      }
      
      console.log('');
    }
    
    console.log(`\nTotal files: ${fileCount}`);
    
  } catch (error) {
    console.error('Error listing vector database files:', error);
    process.exit(1);
  }
}

// Run the script
listVectorDbFiles();