import FirecrawlApp from '@mendable/firecrawl-js';
import { openai } from '../openai-client';
import { createVectorStoreFilename, extractHashFromFilename } from './hash-utils';
import { getOrCreateVectorStore } from './vector-store-utils';

interface ScrapeResult {
  uploaded: string[];
  updated: string[];
  failed: { url: string; error: string }[];
}

export async function scrapeAndSyncToVectorStore(url: string, vectorStoreKey: string = 'web-scrape-default'): Promise<ScrapeResult> {
  console.log('\n🚀 Starting Web Crawl to Vector Store Sync');
  console.log(`${'═'.repeat(50)}`);
  console.log(`🌐 URL to crawl: ${url}`);
  console.log(`🔑 Vector store key: ${vectorStoreKey}`);
  
  const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
  const vectorStore = await getOrCreateVectorStore(vectorStoreKey);
  console.log(`📦 Using vector store: ${vectorStore.id}`);
  
  // Get existing files
  console.log(`📂 Fetching existing files from vector store...`);
  const existingFiles = await openai.vectorStores.files.list(vectorStore.id);
  const existingFileMap = new Map<string, any>();
  
  for await (const file of existingFiles) {
    const fileDetails = await openai.files.retrieve(file.id);
    existingFileMap.set(fileDetails.filename, file);
    console.log(`  - Found existing file: ${fileDetails.filename}`);
  }
  console.log(`📊 Total existing files found: ${existingFileMap.size}`);

  // Crawl the URL
  console.log(`\n🌐 Crawling URL: ${url}`);
  const res = await app.crawlUrl(url, 
    { scrapeOptions: { formats: ['markdown'] } }
  );

  if (res.success === false) {
    console.log(`  ❌ Crawl failed`);
    return {
      uploaded: [],
      updated: [],
      failed: [{ url, error: 'Crawl failed' }]
    };
  }

  const pages = res.data;
  console.log(`  ✅ Successfully crawled ${pages.length} pages`);

  const results: ScrapeResult = {
    uploaded: [],
    updated: [],
    failed: []
  };

  // Process each page separately
  for (const page of pages) {
    const pageUrl = page.metadata!.sourceURL;
    const content = page.markdown;
    
    if (!content) {
      results.failed.push({ url: pageUrl!, error: 'No content' });
      continue;
    }

    console.log(`\n🔄 Processing page: ${pageUrl}`);
    console.log(`  - Content length: ${content.length} characters`);
    
    try {
      // Generate filename for this page
      const filename = createVectorStoreFilename(pageUrl!, content);
      console.log(`  - Generated filename: ${filename}`);
      
      // Check if this page already exists
      const existingFile = findExistingFile(existingFileMap, pageUrl!);
      
      if (existingFile) {
        const existingHash = extractHashFromFilename(existingFile.filename);
        const newHash = filename.split('-')[0];
        
        if (existingHash !== newHash) {
          console.log(`  - Content changed (${existingHash} → ${newHash}), updating...`);
          // Delete old file
          await openai.vectorStores.files.delete(existingFile.file.id, { 
            vector_store_id: vectorStore.id 
          });
          // Upload new file
          await uploadFile(vectorStore.id, filename, content);
          results.updated.push(pageUrl!);
        } else {
          console.log(`  - Content unchanged, skipping`);
        }
      } else {
        console.log(`  - New page, uploading...`);
        await uploadFile(vectorStore.id, filename, content);
        results.uploaded.push(pageUrl!);
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      results.failed.push({ 
        url: pageUrl!, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  console.log(`\n📊 Final Results:`);
  console.log(`${'═'.repeat(50)}`);
  console.log(`✅ Uploaded: ${results.uploaded.length} pages`);
  console.log(`🔄 Updated: ${results.updated.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  return results;
}

function findExistingFile(existingFileMap: Map<string, any>, url: string): { filename: string; file: any } | null {
  const sanitizedUrl = url.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  
  for (const [filename, file] of existingFileMap.entries()) {
    const filenameWithoutHash = filename.replace(/^[a-f0-9]{8}-/, '').replace(/\.md$/, '');
    if (filenameWithoutHash === sanitizedUrl) {
      return { filename, file };
    }
  }
  
  return null;
}

async function uploadFile(vectorStoreId: string, filename: string, content: string): Promise<void> {
  const file = await openai.files.create({
    file: new File([content], filename, { type: 'text/markdown' }),
    purpose: 'assistants'
  });
  
  await openai.vectorStores.files.create(vectorStoreId, {
    file_id: file.id
  });
  
  console.log(`  ✅ Uploaded successfully`);
}