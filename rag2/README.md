# RAG2 - OpenAI Vector Store RAG System

A complete Retrieval-Augmented Generation (RAG) system built with OpenAI's Vector Store API for semantic search over knowledge base documents.

## Features

- **Document Processing**: Intelligent chunking of markdown files with metadata preservation
- **Vector Storage**: Uses OpenAI's Vector Store for embeddings and search
- **Semantic Search**: Natural language queries over your knowledge base
- **Makefile Operations**: Complete command-line interface for all operations
- **TypeScript**: Fully typed implementation with modern ES modules

## Quick Start

### 1. Setup

```bash
# Install dependencies and create .env file
make quick-setup

# Edit .env with your OpenAI API key
vim .env
```

### 2. Upload Knowledge Base

```bash
# Create new vector store and upload all documents
make upload-new

# Or upload to existing store (if VECTOR_STORE_ID is set)
make upload
```

### 3. Search

```bash
# Search the knowledge base
make search QUERY="how to fix audio issues"
make search QUERY="what subscription plans are available"
```

## Available Commands

### Setup & Installation
- `make install` - Install dependencies
- `make setup-env` - Create .env from template
- `make build` - Build TypeScript

### Data Management
- `make upload` - Upload to existing vector store
- `make upload-new` - Create new store and upload
- `make wipe` - Clear vector store data
- `make delete` - Delete entire vector store

### Search & Query
- `make search QUERY="..."` - Search knowledge base
- `make test-search` - Run predefined searches

### Testing & Info
- `make test` - Run complete test suite
- `make info` - Show vector store information
- `make status` - Check system status

### Quick Workflows
- `make quick-setup` - Install + setup .env
- `make reset` - Wipe and re-upload data
- `make full-reset` - Delete store and recreate

## Configuration

Create `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
VECTOR_STORE_ID=vs_xxxxx  # Set after first upload
OPENAI_PROJECT_ID=your_project_id  # Optional
```

## Architecture

### Document Processing
- Finds all `.md` files in knowledge base
- Extracts frontmatter and metadata
- Chunks content intelligently by sections
- Preserves source information and context

### Vector Storage
- Uses OpenAI's Vector Store API
- Each chunk becomes a searchable document
- Metadata enables filtered search
- Automatic embedding generation

### Search
- Creates temporary assistant with vector store
- Processes natural language queries
- Returns relevant content with context
- Cleanup after each search

## File Structure

```
rag2/
├── src/
│   ├── config.ts           # Configuration management
│   ├── openai-client.ts    # OpenAI API client
│   ├── document-processor.ts # Document parsing and chunking
│   ├── vector-store.ts     # Vector store operations
│   ├── upload.ts           # Upload command
│   ├── search.ts           # Search command
│   ├── wipe.ts             # Data management commands
│   ├── test.ts             # Test suite
│   └── index.ts            # Public API exports
├── Makefile                # All operations
├── package.json
├── tsconfig.json
└── .env.example
```

## Knowledge Base Format

The system expects markdown files with this structure:

```
demo-data/knowledge-base/
├── README.md
├── category1/
│   ├── document1.md
│   └── document2.md
└── category2/
    └── document3.md
```

Each document can include frontmatter:

```markdown
---
title: "Document Title"
category: "custom-category"
tags: ["tag1", "tag2"]
---

# Document Content

Your markdown content here...
```

## Examples

### Upload New Data
```bash
# Create fresh vector store
make upload-new

# Check status
make info
```

### Search Examples
```bash
make search QUERY="audio not working"
make search QUERY="subscription pricing"
make search QUERY="how to create account"
```

### Reset Data
```bash
# Clear and re-upload
make reset

# Or start completely fresh
make full-reset
```

## Troubleshooting

### Common Issues

**No results found:**
- Check if data was uploaded: `make info`
- Verify vector store has completed files
- Try different search terms

**Upload fails:**
- Check OpenAI API key in `.env`
- Verify knowledge base path exists
- Check file permissions

**Search timeouts:**
- Try shorter, more specific queries
- Check OpenAI API status
- Verify vector store status

### Debug Commands

```bash
# Check system status
make status

# Run test suite
make test

# Get detailed info
make info
```

## API Usage

You can also use the system programmatically:

```typescript
import { VectorStoreManager, DocumentProcessor } from './src/index.js';

// Create manager
const manager = new VectorStoreManager('vs_your_id');

// Upload documents
await manager.uploadDocuments();

// Search
const results = await manager.searchDocuments('your query');
```

## Requirements

- Node.js 18+
- OpenAI API key with sufficient credits
- TypeScript 5+
- Make (for command interface)

## License

MIT