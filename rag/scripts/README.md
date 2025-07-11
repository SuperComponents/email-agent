# Knowledge Document Generation Scripts

This directory contains scripts for generating comprehensive knowledge base documents for **Treslingo**, a Spanish language learning app similar to Duolingo but with a friendly cat mascot.

## 📋 Available Scripts

### 1. `knowledge-generator-ai.ts` - Core AI Generator
The foundational AI knowledge generation engine using OpenAI's GPT-4o-mini.

**Features:**
- Generates detailed knowledge documents about Treslingo features and policies
- Supports multiple document categories
- Flexible content generation with different detail levels
- Proper markdown formatting with frontmatter metadata

### 2. `generate-knowledge.ts` - Direct Markdown Generation
Generates knowledge documents and saves them directly as markdown files.

**Usage:**
```bash
# Generate 10 knowledge documents (default)
npm run generate:knowledge

# Generate 3 test documents
npm run generate:knowledge -- --test

# Generate 5 FAQ documents
npm run generate:knowledge -- --count 5 --category faq

# Generate documents by type (equal distribution)
npm run generate:knowledge -- --by-type --count 10

# Generate documents about a specific topic
npm run generate:knowledge -- --topic "streak problems" --category troubleshooting

# Generate comprehensive documents with overwrite
npm run generate:knowledge -- --count 20 --detail-level comprehensive --overwrite
```

**Options:**
- `--test` - Generate 3 test documents
- `--count <number>` - Number of documents to generate (default: 10)
- `--category <type>` - Category: policy, faq, troubleshooting, general, procedures, all (default: all)
- `--output-dir <path>` - Output directory (default: ../knowledge_base)
- `--detail-level <level>` - Detail level: basic, detailed, comprehensive (default: detailed)
- `--by-type` - Generate equal numbers of each document type
- `--topic <topic>` - Generate documents about a specific topic
- `--overwrite` - Overwrite existing files

### 3. `generate-knowledge-json.ts` - JSON Generation
Generates knowledge documents and saves them as structured JSON files for later processing.

**Usage:**
```bash
# Generate 10 documents as JSON
npm run generate:knowledge-json

# Generate test documents
npm run generate:knowledge-json -- --test

# Generate 20 FAQ documents
npm run generate:knowledge-json -- --count 20 --category faq

# Generate by type with specific output file
npm run generate:knowledge-json -- --by-type --count 15 --output my-knowledge.json

# Append to existing JSON file
npm run generate:knowledge-json -- --count 5 --append --output existing-file.json

# Generate about billing issues
npm run generate:knowledge-json -- --topic "billing issues" --category troubleshooting --count 3
```

**Options:**
- `--test` - Generate 3 test documents
- `--count <number>` - Number of documents to generate (default: 10)
- `--category <type>` - Category: policy, faq, troubleshooting, general, procedures, all (default: all)
- `--output-dir <path>` - Output directory (default: knowledge-data)
- `--detail-level <level>` - Detail level: basic, detailed, comprehensive (default: detailed)
- `--by-type` - Generate equal numbers of each document type
- `--topic <topic>` - Generate documents about a specific topic
- `--output <filename>` - Specify output filename (default: auto-generated)
- `--append` - Append to existing JSON file

### 4. `knowledge-to-markdown.ts` - JSON to Markdown Converter
Converts JSON knowledge files to individual markdown files for use in the knowledge base.

**Usage:**
```bash
# Convert JSON to markdown files
npm run knowledge-to-markdown -- --input knowledge-data/knowledge-2025-07-11.json

# Convert with overwrite and category directories
npm run knowledge-to-markdown -- --input my-docs.json --overwrite --category-dirs

# Convert without metadata
npm run knowledge-to-markdown -- --input docs.json --no-metadata --output-dir ./custom-output
```

**Options:**
- `--input <file>` - Input JSON file path (required)
- `--output-dir <path>` - Output directory (default: ../knowledge_base)
- `--overwrite` - Overwrite existing markdown files
- `--no-metadata` - Don't add frontmatter metadata to markdown files
- `--category-dirs` - Organize files in category subdirectories

## 🏢 Generated Content Overview

The AI generates realistic knowledge base documents for **Treslingo**, a Spanish learning app:

### Company Details:
- **Founded**: 2023
- **Platform**: Mobile-only (iOS and Android)
- **Focus**: Spanish language learning exclusively
- **Business Model**: Freemium (free tier + premium subscription)
- **Mascot**: Friendly cat companion
- **Pricing**: $9.99/month for premium

### App Features:
- **Free tier**: Basic lessons, limited hearts (5/day), ads
- **Premium tier**: No ads, unlimited hearts, offline mode
- **Learning System**: Daily streaks, XP points, achievements, leaderboards
- **Content**: Vocabulary, grammar, speaking, listening, cultural lessons
- **Technical**: Real-time sync, offline downloads, voice recognition

### Knowledge Categories:

#### 📝 **General (30%)** - App features and functionality
- How-to guides for app features
- Learning system explanations
- Account management procedures
- Feature tutorials and tips

#### 🔧 **Troubleshooting (25%)** - Technical issue resolution
- App crashes and performance issues
- Audio/microphone problems
- Account sync and login issues
- Payment and subscription problems

#### 📜 **Policy (20%)** - Company policies and terms
- Privacy policy and data handling
- Terms of service and usage rules
- Refund and billing policies
- Content guidelines and community rules

#### ❓ **FAQ (15%)** - Quick answers to common questions
- Common user questions and answers
- Feature explanations and clarifications
- Account and billing quick help
- Learning tips and guidance

#### 🔄 **Procedures (10%)** - Internal processes and workflows
- Customer service escalation procedures
- Account management workflows
- Technical support guidelines
- Content moderation processes

## 🔄 Workflow Examples

### Scenario 1: Create Initial Knowledge Base
```bash
# Generate diverse set of documents by type
npm run generate:knowledge-json -- --by-type --count 25 --detail-level comprehensive

# Convert to markdown files organized by category
npm run knowledge-to-markdown -- --input knowledge-data/knowledge-*.json --category-dirs

# Update vector store with new content
npm run seed
```

### Scenario 2: Add Specific Topic Coverage
```bash
# Generate focused troubleshooting docs
npm run generate:knowledge -- --topic "app crashes" --category troubleshooting --count 5

# Generate billing FAQ
npm run generate:knowledge -- --topic "subscription billing" --category faq --count 3 --overwrite
```

### Scenario 3: Iterative Development
```bash
# Generate initial batch as JSON
npm run generate:knowledge-json -- --count 15 --output base-docs.json

# Add more documents to same file
npm run generate:knowledge-json -- --count 10 --append --output base-docs.json --topic "streaks"

# Convert to final markdown
npm run knowledge-to-markdown -- --input knowledge-data/base-docs.json --overwrite
```

## 📊 Output Formats

### JSON Structure
```json
{
  "metadata": {
    "generated_at": "2025-07-11T15:30:00.000Z",
    "total_documents": 10,
    "generation_options": {
      "category": "all",
      "count": 10,
      "detail_level": "detailed",
      "by_type": false
    },
    "generator_version": "1.0.0",
    "company": "treslingo"
  },
  "documents": [
    {
      "title": "Document Title",
      "category": "faq",
      "filename": "001-document-title.md",
      "content": "# Document Title\n\nContent here...",
      "tags": ["treslingo", "support", "faq"],
      "lastUpdated": "2025-07-11T15:30:00.000Z"
    }
  ]
}
```

### Markdown Output
```markdown
---
title: How to Restore Your Learning Streak
category: troubleshooting
tags: [treslingo, support, troubleshooting, streaks]
last_updated: 2025-07-11T15:30:00.000Z
filename: 001-how-to-restore-your-learning-streak.md
---

# How to Restore Your Learning Streak

If you've lost your learning streak on Treslingo, don't worry! Here are several ways to get back on track...
```

## 🛠️ Requirements

### Environment Variables
- `OPENAI_API_KEY` - Required for AI generation (not needed for conversion scripts)

### Dependencies
All required dependencies are included in the rag package.json:
- `openai` - For AI generation
- `tsx` - For TypeScript execution
- Standard Node.js fs and path modules

## 🚀 Getting Started

1. **Set up environment:**
   ```bash
   cd rag
   npm install
   ```

2. **Test the system:**
   ```bash
   # Test help commands (no API key needed)
   npm run generate:knowledge -- --help
   npm run generate:knowledge-json -- --help
   npm run knowledge-to-markdown -- --help
   ```

3. **Generate your first documents:**
   ```bash
   # Generate test documents (requires OPENAI_API_KEY)
   npm run generate:knowledge-json -- --test
   
   # Convert to markdown
   npm run knowledge-to-markdown -- --input knowledge-data/knowledge-*.json
   ```

## 🔄 Integration with RAG System

The generated knowledge documents integrate seamlessly with the existing RAG system:

1. **Generate knowledge documents** using any of the generation scripts
2. **Place markdown files** in the `knowledge_base/` directory
3. **Update vector store** by running the existing `seed` script
4. **Test knowledge base** using the RAG agents

## 📚 Best Practices

### Content Generation
- Use `--by-type` for balanced coverage across all categories
- Use `--topic` for focused, specific content generation
- Start with `--test` mode to verify setup before large batches
- Use `--detail-level comprehensive` for thorough documentation

### File Management
- Use JSON generation for iterative development and backup
- Convert JSON to markdown for final deployment
- Use `--category-dirs` for organized file structure
- Always use `--overwrite` cautiously to avoid data loss

### Workflow Organization
- Generate documents in batches by category or topic
- Keep JSON backups of all generated content
- Review generated content before deploying to knowledge base
- Test vector store updates after adding new content

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Key Error:**
```
OpenAIError: The OPENAI_API_KEY environment variable is missing
```
- Set your OpenAI API key in environment variables
- The converter scripts don't require API keys

**File Not Found:**
```
Input file not found: knowledge-data/file.json
```
- Check the file path is correct
- Ensure you're in the rag directory when running commands

**Permission Errors:**
- Ensure write permissions to output directories
- Use `--overwrite` to replace existing files

### Getting Help
- Use `--help` flag with any script for detailed usage information
- Check the npm scripts in `package.json` for available commands
- Review generated files in `knowledge-data/` and `knowledge_base/` directories

---

## 📝 License

These scripts are part of the email-agent project and follow the same license terms. 