import { scrapeAndSyncToVectorStore } from './scrape';

async function test() {
  const url = process.env.WEB_CRAWL_URL;
  const vectorStoreKey = process.env.WEB_CRAWL_VECTOR_STORE_KEY;
  
  if (!url || !vectorStoreKey) {
    console.error('❌ Missing required environment variables:');
    if (!url) console.error('  - WEB_CRAWL_URL');
    if (!vectorStoreKey) console.error('  - WEB_CRAWL_VECTOR_STORE_KEY');
    process.exit(1);
  }
  
  try {
    const results = await scrapeAndSyncToVectorStore(url, vectorStoreKey);
    console.log('\nDetailed Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();