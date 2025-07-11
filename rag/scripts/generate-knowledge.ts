import { generateKnowledgeDocuments, generateSingleDocument, generateKnowledgeByType, type GeneratedKnowledgeDocument } from './knowledge-generator-ai.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface GenerateOptions {
  count: number;
  category: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures' | 'all';
  test: boolean;
  outputDir: string;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  byType: boolean;
  topic?: string;
  overwrite: boolean;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 10,
    category: 'all',
    test: false,
    outputDir: '../knowledge_base',
    detailLevel: 'detailed',
    byType: false,
    overwrite: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test':
        console.log('🧪 TEST MODE: Generating 3 knowledge documents only');
        options.test = true;
        options.count = 3;
        break;
      case '--count':
        options.count = parseInt(args[++i], 10);
        console.log(`📊 COUNT: Generating ${options.count} knowledge documents`);
        break;
      case '--category':
        options.category = args[++i] as GenerateOptions['category'];
        console.log(`📂 CATEGORY: Focusing on ${options.category} documents`);
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        console.log(`📁 OUTPUT DIR: Using directory: ${options.outputDir}`);
        break;
      case '--detail-level':
        options.detailLevel = args[++i] as GenerateOptions['detailLevel'];
        console.log(`📝 DETAIL LEVEL: ${options.detailLevel}`);
        break;
      case '--by-type':
        options.byType = true;
        console.log('🎯 BY TYPE: Generating documents by category type');
        break;
      case '--topic':
        options.topic = args[++i];
        console.log(`🎯 TOPIC: Focusing on topic: ${options.topic}`);
        break;
      case '--overwrite':
        options.overwrite = true;
        console.log('⚠️  OVERWRITE: Will overwrite existing files');
        break;
      case '--help':
        console.log(`
Knowledge Document Generator
Usage: npm run generate:knowledge [options]

Options:
  --test                    Generate 3 test documents
  --count <number>          Number of documents to generate (default: 10)
  --category <type>         Category: policy, faq, troubleshooting, general, procedures, all (default: all)
  --output-dir <path>       Output directory (default: ../knowledge_base)
  --detail-level <level>    Detail level: basic, detailed, comprehensive (default: detailed)
  --by-type                 Generate equal numbers of each document type
  --topic <topic>           Generate documents about a specific topic
  --overwrite               Overwrite existing files
  --help                    Show this help message

Examples:
  npm run generate:knowledge -- --test
  npm run generate:knowledge -- --count 5 --category faq
  npm run generate:knowledge -- --by-type --count 2
  npm run generate:knowledge -- --topic "streak problems" --category troubleshooting
        `);
        process.exit(0);
        break;
    }
  }

  return options;
}

function setupOutputDirectory(dir: string): void {
  if (!existsSync(dir)) {
    console.log(`📁 Creating output directory: ${dir}`);
    mkdirSync(dir, { recursive: true });
  } else {
    console.log(`📁 Using existing output directory: ${dir}`);
  }
}

function saveKnowledgeDocument(
  document: { title: string; filename: string; content: string; category: string },
  outputDir: string,
  overwrite: boolean
): boolean {
  const filepath = join(outputDir, document.filename);
  
  // Check if file already exists
  if (existsSync(filepath) && !overwrite) {
    console.log(`⚠️  File already exists, skipping: ${document.filename}`);
    console.log(`   Use --overwrite to replace existing files`);
    return false;
  }

  try {
    console.log(`💾 Saving document: ${document.filename}`);
    console.log(`📂 Category: ${document.category}`);
    console.log(`📄 Title: ${document.title}`);
    
    writeFileSync(filepath, document.content, 'utf8');
    
    const sizeKB = (document.content.length / 1024).toFixed(1);
    console.log(`✅ Successfully saved ${sizeKB}KB to ${document.filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save document ${document.filename}:`, error);
    return false;
  }
}

async function generateAndSaveKnowledge(options: GenerateOptions): Promise<void> {
  console.log(`🚀 Starting knowledge document generation...`);
  console.log(`📚 Target: ${options.count} documents`);
  console.log(`📂 Category: ${options.category}`);
  console.log(`📝 Detail level: ${options.detailLevel}`);

  const startTime = Date.now();
  let generated = 0;
  let saved = 0;
  let errors = 0;

  // Setup output directory
  setupOutputDirectory(options.outputDir);

  try {
    let documents;

    if (options.byType) {
      // Generate equal numbers of each document type
      const types: ('policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures')[] = 
        ['policy', 'faq', 'troubleshooting', 'general', 'procedures'];
      
      const docsPerType = Math.ceil(options.count / types.length);
      console.log(`🎯 Generating ${docsPerType} documents for each type: ${types.join(', ')}`);
      
      documents = await generateKnowledgeByType(types, docsPerType, options.detailLevel);
      
      // Trim to exact count if needed
      if (documents.length > options.count) {
        documents = documents.slice(0, options.count);
      }
      
    } else if (options.topic) {
      // Generate documents about a specific topic
      console.log(`🎯 Generating documents about: "${options.topic}"`);
      
      if (options.count === 1) {
        const singleDoc = await generateSingleDocument(
          options.category as 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures',
          options.topic,
          options.detailLevel
        );
        documents = [singleDoc];
      } else {
        // For multiple documents, use batch generation with topic context
        documents = await generateKnowledgeDocuments({
          category: options.category === 'all' ? undefined : options.category,
          count: options.count,
          detailLevel: options.detailLevel,
          includeMetadata: true
        });
      }
      
    } else {
      // Standard batch generation
      console.log(`📦 Generating ${options.count} documents...`);
      
      documents = await generateKnowledgeDocuments({
        category: options.category === 'all' ? undefined : options.category,
        count: options.count,
        detailLevel: options.detailLevel,
        includeMetadata: true
      });
    }

    console.log(`✅ AI generated ${documents.length} knowledge documents`);
    generated = documents.length;

    // Save each document
    for (const document of documents) {
      try {
        const success = saveKnowledgeDocument(document, options.outputDir, options.overwrite);
        if (success) {
          saved++;
        }
      } catch (error) {
        console.error(`❌ Failed to save document "${document.title}":`, error);
        errors++;
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error during generation:', error);
    throw error;
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n🎉 Knowledge generation complete!`);
  console.log(`📊 Final Results:`);
  console.log(`  - Documents generated: ${generated}`);
  console.log(`  - Documents saved: ${saved}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`  - Duration: ${duration.toFixed(1)}s`);
  console.log(`  - Rate: ${(generated / duration).toFixed(1)} documents/second`);
  console.log(`  - Output directory: ${options.outputDir}`);
  
  if (saved > 0) {
    console.log(`\n📁 Generated files in ${options.outputDir}:`);
    // Don't list files here as it could be many
    console.log(`   Check the directory for ${saved} new markdown files`);
    
    if (!options.test) {
      console.log(`\n🔄 Next steps:`);
      console.log(`   1. Review the generated knowledge documents`);
      console.log(`   2. Run the vector store sync to update AI knowledge base`);
      console.log(`   3. Test the updated knowledge base with your agents`);
    }
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('\n📚 Knowledge Document Generation');
  console.log('==================================');
  
  if (options.test) {
    console.log('🧪 Running in TEST mode');
  }

  try {
    await generateAndSaveKnowledge(options);
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 