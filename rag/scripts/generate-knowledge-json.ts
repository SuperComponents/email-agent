import { generateKnowledgeDocuments, generateSingleDocument, generateKnowledgeByType, type GeneratedKnowledgeDocument } from './knowledge-generator-ai.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface GenerateOptions {
  count: number;
  category: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures' | 'all';
  test: boolean;
  outputDir: string;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  byType: boolean;
  topic?: string;
  output?: string;
  append: boolean;
}

interface KnowledgeDataSet {
  metadata: {
    generated_at: string;
    total_documents: number;
    generation_options: {
      category: string;
      count: number;
      detail_level: string;
      by_type: boolean;
      topic?: string;
    };
    generator_version: string;
    company: string;
  };
  documents: GeneratedKnowledgeDocument[];
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    count: 10,
    category: 'all',
    test: false,
    outputDir: 'knowledge-data',
    detailLevel: 'detailed',
    byType: false,
    append: false,
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
      case '--output':
        options.output = args[++i];
        console.log(`📄 OUTPUT FILE: ${options.output}`);
        break;
      case '--append':
        options.append = true;
        console.log('📝 APPEND MODE: Adding to existing JSON file');
        break;
      case '--help':
        console.log(`
Knowledge Document JSON Generator
Usage: npm run generate:knowledge-json [options]

Options:
  --test                    Generate 3 test documents
  --count <number>          Number of documents to generate (default: 10)
  --category <type>         Category: policy, faq, troubleshooting, general, procedures, all (default: all)
  --output-dir <path>       Output directory (default: knowledge-data)
  --detail-level <level>    Detail level: basic, detailed, comprehensive (default: detailed)
  --by-type                 Generate equal numbers of each document type
  --topic <topic>           Generate documents about a specific topic
  --output <filename>       Specify output filename (default: auto-generated)
  --append                  Append to existing JSON file
  --help                    Show this help message

Examples:
  npm run generate:knowledge-json -- --test
  npm run generate:knowledge-json -- --count 20 --category faq
  npm run generate:knowledge-json -- --by-type --count 10
  npm run generate:knowledge-json -- --topic "billing issues" --category troubleshooting
  npm run generate:knowledge-json -- --count 5 --append --output knowledge-2025-07-11.json
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

function loadExistingData(filepath: string): KnowledgeDataSet | null {
  if (!existsSync(filepath)) {
    return null;
  }

  try {
    console.log(`📖 Loading existing data from: ${filepath}`);
    const content = readFileSync(filepath, 'utf8');
    const data = JSON.parse(content) as KnowledgeDataSet;
    console.log(`📊 Found ${data.documents.length} existing documents`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to load existing data:`, error);
    return null;
  }
}

function generateNextDocumentId(existingData?: KnowledgeDataSet | null): number {
  if (!existingData) {
    return 1;
  }

  // Find the highest ID in existing documents (assuming IDs are sequential)
  const maxId = Math.max(...existingData.documents.map(doc => {
    // Extract ID from filename if it follows pattern like "001-document-name.md"
    const match = doc.filename.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : 0;
  }), 0);

  return maxId + 1;
}

function addDocumentIds(documents: GeneratedKnowledgeDocument[], startId: number): GeneratedKnowledgeDocument[] {
  return documents.map((doc, index) => {
    const id = startId + index;
    const idStr = id.toString().padStart(3, '0');
    
    // Update filename to include ID
    if (!doc.filename.match(/^\d{3}-/)) {
      const nameWithoutExt = doc.filename.replace(/\.md$/, '');
      doc.filename = `${idStr}-${nameWithoutExt}.md`;
    }

    return doc;
  });
}

function createKnowledgeDataSet(
  documents: GeneratedKnowledgeDocument[],
  options: GenerateOptions,
  existingData?: KnowledgeDataSet | null
): KnowledgeDataSet {
  const now = new Date().toISOString();
  
  if (existingData && options.append) {
    // Append to existing data
    const updatedDocuments = [...existingData.documents, ...documents];
    
    return {
      ...existingData,
      metadata: {
        ...existingData.metadata,
        generated_at: now,
        total_documents: updatedDocuments.length,
        generation_options: {
          ...existingData.metadata.generation_options,
          // Update with latest generation options
          category: options.category,
          count: options.count,
          detail_level: options.detailLevel,
          by_type: options.byType,
          topic: options.topic,
        },
      },
      documents: updatedDocuments,
    };
  } else {
    // Create new data set
    return {
      metadata: {
        generated_at: now,
        total_documents: documents.length,
        generation_options: {
          category: options.category,
          count: options.count,
          detail_level: options.detailLevel,
          by_type: options.byType,
          topic: options.topic,
        },
        generator_version: '1.0.0',
        company: 'treslingo',
      },
      documents,
    };
  }
}

function saveKnowledgeDataSet(dataSet: KnowledgeDataSet, filepath: string): void {
  console.log(`💾 Saving knowledge data to: ${filepath}`);
  
  const jsonContent = JSON.stringify(dataSet, null, 2);
  writeFileSync(filepath, jsonContent, 'utf8');
  
  const sizeKB = (jsonContent.length / 1024).toFixed(1);
  console.log(`✅ Successfully saved ${sizeKB}KB to ${filepath}`);
}

function generateOutputFilename(options: GenerateOptions): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  return `knowledge-${timestamp}.json`;
}

function validateGeneratedDocuments(documents: GeneratedKnowledgeDocument[]): void {
  console.log(`🔍 Validating ${documents.length} generated documents...`);
  
  let errors = 0;
  
  for (const [index, doc] of documents.entries()) {
    // Check required fields
    if (!doc.title) {
      console.error(`❌ Document ${index + 1}: Missing title`);
      errors++;
    }
    if (!doc.content) {
      console.error(`❌ Document ${index + 1}: Missing content`);
      errors++;
    }
    if (!doc.filename) {
      console.error(`❌ Document ${index + 1}: Missing filename`);
      errors++;
    }
    
    // Check filename format
    if (doc.filename && !doc.filename.endsWith('.md')) {
      console.error(`❌ Document ${index + 1}: Filename should end with .md`);
      errors++;
    }
    
    // Check category
    const validCategories = ['policy', 'faq', 'troubleshooting', 'general', 'procedures'];
    if (!validCategories.includes(doc.category)) {
      console.error(`❌ Document ${index + 1}: Invalid category: ${doc.category}`);
      errors++;
    }
  }
  
  if (errors > 0) {
    throw new Error(`Validation failed with ${errors} errors`);
  }
  
  console.log(`✅ All documents validated successfully`);
}

async function generateAndSaveKnowledgeJSON(options: GenerateOptions): Promise<void> {
  console.log(`🚀 Starting JSON knowledge document generation...`);
  console.log(`📚 Target: ${options.count} documents`);
  console.log(`📂 Category: ${options.category}`);
  console.log(`📝 Detail level: ${options.detailLevel}`);

  const startTime = Date.now();

  // Setup output directory
  setupOutputDirectory(options.outputDir);

  // Determine output filename
  let outputFilename = options.output || generateOutputFilename(options);
  if (!outputFilename.endsWith('.json')) {
    outputFilename += '.json';
  }
  const outputPath = join(options.outputDir, outputFilename);

  // Load existing data if appending
  let existingData: KnowledgeDataSet | null = null;
  if (options.append && options.output) {
    existingData = loadExistingData(outputPath);
  }

  try {
    // Generate documents
    let documents: GeneratedKnowledgeDocument[];

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

    // Validate documents
    validateGeneratedDocuments(documents);

    // Add document IDs
    const startId = generateNextDocumentId(existingData);
    const documentsWithIds = addDocumentIds(documents, startId);
    console.log(`🔢 Added document IDs starting from: ${startId.toString().padStart(3, '0')}`);

    // Create data set
    const dataSet = createKnowledgeDataSet(documentsWithIds, options, existingData);

    // Save to JSON
    saveKnowledgeDataSet(dataSet, outputPath);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n🎉 Knowledge JSON generation complete!`);
    console.log(`📊 Final Results:`);
    console.log(`  - Documents generated: ${documents.length}`);
    console.log(`  - Total documents in file: ${dataSet.documents.length}`);
    console.log(`  - Duration: ${duration.toFixed(1)}s`);
    console.log(`  - Rate: ${(documents.length / duration).toFixed(1)} documents/second`);
    console.log(`  - Output file: ${outputPath}`);
    
    if (!options.test) {
      console.log(`\n🔄 Next steps:`);
      console.log(`   1. Convert JSON to markdown files: npm run knowledge-to-markdown -- --input ${outputFilename}`);
      console.log(`   2. Review the generated knowledge documents`);
      console.log(`   3. Update the vector store with new content`);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during generation:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const options = parseArgs();

  console.log('\n📚 Knowledge Document JSON Generation');
  console.log('=====================================');
  
  if (options.test) {
    console.log('🧪 Running in TEST mode');
  }

  try {
    await generateAndSaveKnowledgeJSON(options);
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