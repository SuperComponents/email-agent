import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface GeneratedKnowledgeDocument {
  title: string;
  category: 'policy' | 'faq' | 'troubleshooting' | 'general' | 'procedures';
  filename: string;
  content: string;
  tags: string[];
  lastUpdated: string;
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

interface ConvertOptions {
  input: string;
  outputDir: string;
  overwrite: boolean;
  addMetadata: boolean;
  categoryDirs: boolean;
}

function parseArgs(): ConvertOptions {
  const args = process.argv.slice(2);
  const options: ConvertOptions = {
    input: '',
    outputDir: '../knowledge_base',
    overwrite: false,
    addMetadata: true,
    categoryDirs: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[++i];
        console.log(`📄 INPUT: ${options.input}`);
        break;
      case '--output-dir':
        options.outputDir = args[++i];
        console.log(`📁 OUTPUT DIR: ${options.outputDir}`);
        break;
      case '--overwrite':
        options.overwrite = true;
        console.log('⚠️  OVERWRITE: Will overwrite existing files');
        break;
      case '--no-metadata':
        options.addMetadata = false;
        console.log('📝 NO METADATA: Will not add frontmatter metadata');
        break;
      case '--category-dirs':
        options.categoryDirs = true;
        console.log('📂 CATEGORY DIRS: Will organize files by category directories');
        break;
      case '--help':
        console.log(`
Knowledge JSON to Markdown Converter
Usage: npm run knowledge-to-markdown [options]

Options:
  --input <file>            Input JSON file path (required)
  --output-dir <path>       Output directory (default: ../knowledge_base)
  --overwrite               Overwrite existing markdown files
  --no-metadata             Don't add frontmatter metadata to markdown files
  --category-dirs           Organize files in category subdirectories
  --help                    Show this help message

Examples:
  npm run knowledge-to-markdown -- --input knowledge-data/knowledge-2025-07-11.json
  npm run knowledge-to-markdown -- --input knowledge-data/my-docs.json --overwrite
  npm run knowledge-to-markdown -- --input docs.json --output-dir ./output --category-dirs
        `);
        process.exit(0);
        break;
    }
  }

  if (!options.input) {
    console.error('❌ Error: --input parameter is required');
    console.log('Use --help for usage information');
    process.exit(1);
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

function createCategoryDirectories(baseDir: string, categories: string[]): void {
  for (const category of categories) {
    const categoryDir = join(baseDir, category);
    if (!existsSync(categoryDir)) {
      console.log(`📁 Creating category directory: ${category}/`);
      mkdirSync(categoryDir, { recursive: true });
    }
  }
}

function loadKnowledgeData(filepath: string): KnowledgeDataSet {
  console.log(`📖 Loading knowledge data from: ${filepath}`);
  
  if (!existsSync(filepath)) {
    throw new Error(`Input file not found: ${filepath}`);
  }

  try {
    const content = readFileSync(filepath, 'utf8');
    const data = JSON.parse(content) as KnowledgeDataSet;
    
    console.log(`📊 Loaded ${data.documents.length} knowledge documents`);
    console.log(`📅 Generated: ${data.metadata.generated_at}`);
    console.log(`🏢 Company: ${data.metadata.company}`);
    
    return data;
  } catch (error) {
    throw new Error(`Failed to parse JSON file: ${String(error)}`);
  }
}

function formatMarkdownContent(document: GeneratedKnowledgeDocument, addMetadata: boolean): string {
  let content = document.content;

  // If the content already has frontmatter, remove it if we're not adding metadata
  // or if we want to regenerate it
  if (content.startsWith('---\n')) {
    const endIndex = content.indexOf('\n---\n', 4);
    if (endIndex !== -1) {
      content = content.substring(endIndex + 5).trim();
    }
  }

  // Add our own frontmatter if requested
  if (addMetadata) {
    const frontmatter = `---
title: ${document.title}
category: ${document.category}
tags: [${document.tags.join(', ')}]
last_updated: ${document.lastUpdated}
filename: ${document.filename}
---

`;
    content = frontmatter + content;
  }

  // Ensure content ends with a newline
  if (!content.endsWith('\n')) {
    content += '\n';
  }

  return content;
}

function saveMarkdownDocument(
  document: GeneratedKnowledgeDocument,
  outputDir: string,
  options: ConvertOptions
): boolean {
  // Determine output path
  let outputPath: string;
  
  if (options.categoryDirs) {
    // Save in category subdirectory
    const categoryDir = join(outputDir, document.category);
    outputPath = join(categoryDir, document.filename);
  } else {
    // Save directly in output directory
    outputPath = join(outputDir, document.filename);
  }

  // Check if file already exists
  if (existsSync(outputPath) && !options.overwrite) {
    console.log(`⚠️  File already exists, skipping: ${document.filename}`);
    console.log(`   Use --overwrite to replace existing files`);
    return false;
  }

  try {
    console.log(`💾 Saving: ${document.filename}`);
    console.log(`   📂 Category: ${document.category}`);
    console.log(`   📄 Title: ${document.title}`);
    
    const content = formatMarkdownContent(document, options.addMetadata);
    writeFileSync(outputPath, content, 'utf8');
    
    const sizeKB = (content.length / 1024).toFixed(1);
    console.log(`   ✅ Saved ${sizeKB}KB to ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save ${document.filename}:`, error);
    return false;
  }
}

function generateSummaryReport(
  dataSet: KnowledgeDataSet,
  saved: number,
  skipped: number,
  errors: number,
  outputDir: string
): void {
  const reportContent = `# Knowledge Base Conversion Report

## Conversion Summary
- **Source File**: Generated on ${dataSet.metadata.generated_at}
- **Total Documents**: ${dataSet.metadata.total_documents}
- **Successfully Converted**: ${saved}
- **Skipped (Already Exist)**: ${skipped}
- **Errors**: ${errors}
- **Output Directory**: ${outputDir}

## Generation Details
- **Category**: ${dataSet.metadata.generation_options.category}
- **Count**: ${dataSet.metadata.generation_options.count}
- **Detail Level**: ${dataSet.metadata.generation_options.detail_level}
- **By Type**: ${dataSet.metadata.generation_options.by_type}
- **Topic**: ${dataSet.metadata.generation_options.topic || 'N/A'}
- **Generator Version**: ${dataSet.metadata.generator_version}
- **Company**: ${dataSet.metadata.company}

## Documents by Category
${Object.entries(
  dataSet.documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([category, count]) => `- **${category}**: ${count} documents`).join('\n')}

## File List
${dataSet.documents.map(doc => `- \`${doc.filename}\` - ${doc.title} (${doc.category})`).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
`;

  const reportPath = join(outputDir, 'conversion-report.md');
  writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`📋 Conversion report saved to: ${reportPath}`);
}

function convertKnowledgeToMarkdown(options: ConvertOptions): void {
  console.log(`🚀 Starting knowledge JSON to Markdown conversion...`);
  console.log(`📄 Input: ${options.input}`);
  console.log(`📁 Output: ${options.outputDir}`);

  const startTime = Date.now();
  let saved = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Load knowledge data
    const dataSet = loadKnowledgeData(options.input);

    // Setup output directory
    setupOutputDirectory(options.outputDir);

    // Create category directories if needed
    if (options.categoryDirs) {
      const categories = [...new Set(dataSet.documents.map(doc => doc.category))];
      createCategoryDirectories(options.outputDir, categories);
    }

    console.log(`\n🔄 Converting ${dataSet.documents.length} documents...`);

    // Convert each document
    for (const document of dataSet.documents) {
      try {
        const success = saveMarkdownDocument(document, options.outputDir, options);
        if (success) {
          saved++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Failed to convert "${document.title}":`, error);
        errors++;
      }
    }

    // Generate summary report
    generateSummaryReport(dataSet, saved, skipped, errors, options.outputDir);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n🎉 Conversion complete!`);
    console.log(`📊 Final Results:`);
    console.log(`  - Documents converted: ${saved}`);
    console.log(`  - Skipped (existing): ${skipped}`);
    console.log(`  - Errors: ${errors}`);
    console.log(`  - Duration: ${duration.toFixed(1)}s`);
    console.log(`  - Rate: ${(dataSet.documents.length / duration).toFixed(1)} documents/second`);
    console.log(`  - Output directory: ${options.outputDir}`);
    
    if (saved > 0) {
      console.log(`\n🔄 Next steps:`);
      console.log(`   1. Review the generated markdown files in ${options.outputDir}`);
      console.log(`   2. Update the vector store with new knowledge: npm run seed`);
      console.log(`   3. Test the updated knowledge base with your RAG system`);
      
      if (options.categoryDirs) {
        console.log(`   4. Files are organized by category in subdirectories`);
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error during conversion:', error);
    throw error;
  }
}

// Main execution
function main() {
  const options = parseArgs();

  console.log('\n📚 Knowledge JSON to Markdown Conversion');
  console.log('=========================================');

  try {
    convertKnowledgeToMarkdown(options);
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
} 