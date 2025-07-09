# RAG Vector Store Utilities

Utilities for accessing OpenAI vector stores that are automatically synced from `rag/knowledge_base/**/*.md` files.

## Auto-Sync

The GitHub workflow at `.github/workflows/sync-vector-store.yml` automatically syncs markdown files in `rag/knowledge_base/` to an OpenAI vector store. This sync only runs:
- On the `master` and `rag` branches
- When `.md` files in `rag/knowledge_base/` are changed

## Functions

```typescript
import { getVectorStore, getVectorStoreId } from '../rag/dist/index.js';

// Get the full vector store object
const vectorStore = await getVectorStore(openai, optionalKey);

// Get just the vector store ID
const vectorStoreId = await getVectorStoreId(openai, optionalKey);
```

you probably dont need to pass in the key but you do need to pass in your openai client instance

Both functions:
- Take an OpenAI client instance
- Search for a vector store with matching metadata key (default: `'emailsmart-knowledge-base'`)
- Throw if not found, warn if multiple matches

## Usage

```typescript
import { OpenAI } from 'openai';
import { getVectorStoreId } from '../rag/dist/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const vectorStoreId = await getVectorStoreId(openai);
```

## With OpenAI Agents

```typescript
import { Agent, run, fileSearchTool } from '@openai/agents';
import { getVectorStoreId } from '../rag/dist/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const vectorStoreId = await getVectorStoreId(openai);

const knowledgeBaseSearchTool = fileSearchTool(vectorStoreId);

const agent = new Agent({
  name: 'MyAgent',
  model: 'gpt-4o-mini',
  instructions: 'Use the file search tool to find information from our documentation.',
  tools: [knowledgeBaseSearchTool],
});

const result = await run(agent, 'What is our warranty policy?');
```