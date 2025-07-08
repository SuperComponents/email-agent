# RAG Integration Guide 📚

**Complete guide for integrating ProResponse Agent v2.0.0 with your RAG (Retrieval-Augmented Generation) system.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Current Implementation](#current-implementation)
- [Integration Architecture](#integration-architecture)
- [Backend Requirements](#backend-requirements)
- [Step-by-Step Integration](#step-by-step-integration)
- [API Specifications](#api-specifications)
- [Database Schema](#database-schema)
- [Vector Database Setup](#vector-database-setup)
- [Content Indexing](#content-indexing)
- [Performance Optimization](#performance-optimization)
- [Testing & Validation](#testing--validation)
- [Deployment Considerations](#deployment-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

The RAG system integration allows ProResponse Agent to access your company's knowledge base, policies, procedures, and documentation to provide accurate, consistent customer support responses.

### **🎯 Integration Goals**
- **Accurate Responses**: Ensure answers align with company policies
- **Consistent Information**: Eliminate conflicting or outdated responses
- **Real-time Updates**: Keep knowledge base current and searchable
- **Semantic Search**: Find relevant information based on meaning, not just keywords
- **Performance**: Sub-3-second response times for knowledge queries

### **📊 Current Status**
- ✅ **Skeleton Functions**: Complete interfaces and error handling
- ✅ **Mock Data**: Development and testing ready
- ✅ **Tool Integration**: Wired into OpenAI Assistant
- ✅ **Logging**: Comprehensive monitoring and debugging
- 🔄 **Backend Integration**: Ready for your implementation

---

## Current Implementation

### **📁 Files to Modify**

```
agent/src/
├── ragSystem.ts      # 🔧 Main integration file (replace skeleton functions)
├── tools.ts          # ✅ Already integrated (no changes needed)
├── types.ts          # ✅ Complete interfaces (extend if needed)
└── enhancedAgent.ts  # ✅ Agent integration (no changes needed)
```

### **🔧 Skeleton Functions to Replace**

```typescript
// src/ragSystem.ts - Replace these functions:

export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]>
export async function queryCompanyPolicies(policyQuery: string, policyType?: string): Promise<RAGResult[]>
export async function queryProcedures(procedureQuery: string, issueType?: string): Promise<RAGResult[]>
export async function queryFAQ(faqQuery: string): Promise<RAGResult[]>
export async function generateContextualQueries(emailContent: string, includeCategories?: string[]): Promise<RAGResult[]>
```

---

## Integration Architecture

### **🏗️ Recommended Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ProResponse    │    │   Your RAG      │    │  Vector         │
│  Agent          │    │   Backend API   │    │  Database       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ ragSystem.ts│ │◄──►│ │  /api/rag   │ │◄──►│ │  Embeddings │ │
│ │ functions   │ │    │ │  endpoints  │ │    │ │  & Indexes  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Content        │
                       │  Management     │
                       │  ┌────────────┐ │
                       │  │ Policies   │ │
                       │  │ Procedures │ │
                       │  │ FAQ        │ │
                       │  │ Knowledge  │ │
                       │  └────────────┘ │
                       └─────────────────┘
```

### **🔄 Data Flow**

1. **Agent Query** → ProResponse Agent needs company knowledge
2. **RAG Request** → ragSystem.ts calls your backend API
3. **Semantic Search** → Your backend queries vector database
4. **Results Retrieval** → Relevant documents returned with metadata
5. **Response Integration** → Knowledge integrated into agent response

---

## Backend Requirements

### **🛠️ Technology Stack Recommendations**

#### **Vector Databases (Choose One):**
- **[Pinecone](https://www.pinecone.io/)** - Managed, production-ready
- **[Weaviate](https://weaviate.io/)** - Open source, feature-rich
- **[ChromaDB](https://www.trychroma.com/)** - Lightweight, easy setup
- **[Qdrant](https://qdrant.tech/)** - High performance, open source
- **[PostgreSQL + pgvector](https://github.com/pgvector/pgvector)** - If using PostgreSQL

#### **Embedding Models (Choose One):**
- **OpenAI text-embedding-3-large** - Highest quality
- **OpenAI text-embedding-3-small** - Cost-effective
- **Sentence Transformers** - Open source
- **Cohere Embed** - Multilingual support

#### **Backend Framework (Choose One):**
- **FastAPI** (Python) - Recommended for AI/ML
- **Express.js** (Node.js) - JavaScript ecosystem
- **Spring Boot** (Java) - Enterprise environments
- **ASP.NET Core** (C#) - Microsoft stack

### **📋 Required Capabilities**

- **Semantic Search**: Vector similarity search with embeddings
- **Hybrid Search**: Combine semantic + keyword search
- **Metadata Filtering**: Filter by category, date, source, etc.
- **Relevance Scoring**: Return confidence scores (0-1)
- **Real-time Indexing**: Update knowledge base without downtime
- **Caching**: Cache frequent queries for performance

---

## Step-by-Step Integration

### **🚀 Phase 1: Basic RAG Setup**

#### **1. Set Up Vector Database**

**Example with Pinecone:**
```bash
npm install @pinecone-database/pinecone
```

```typescript
// config/pinecone.ts
import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index('support-knowledge');
```

#### **2. Create Backend API Endpoints**

```typescript
// routes/rag.ts
import express from 'express';
import { searchKnowledge, searchPolicies } from '../services/ragService';

const router = express.Router();

// General knowledge search
router.post('/search', async (req, res) => {
  try {
    const { query, category, maxResults, relevanceThreshold } = req.body;
    const results = await searchKnowledge(query, {
      category,
      maxResults: maxResults || 5,
      relevanceThreshold: relevanceThreshold || 0.6
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Policy-specific search
router.post('/policies', async (req, res) => {
  try {
    const { policyQuery, policyType } = req.body;
    const results = await searchPolicies(policyQuery, policyType);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

#### **3. Implement RAG Service**

```typescript
// services/ragService.ts
import { index } from '../config/pinecone';
import { getEmbedding } from './embeddingService';
import { RAGQuery, RAGResult } from './types';

export async function searchKnowledge(
  query: string, 
  options: {
    category?: string;
    maxResults?: number;
    relevanceThreshold?: number;
  }
): Promise<RAGResult[]> {
  
  // Generate embedding for query
  const queryEmbedding = await getEmbedding(query);
  
  // Search vector database
  const searchRequest = {
    vector: queryEmbedding,
    topK: options.maxResults || 5,
    includeMetadata: true,
    filter: options.category ? { category: options.category } : undefined
  };
  
  const searchResults = await index.query(searchRequest);
  
  // Convert to RAGResult format
  const results: RAGResult[] = searchResults.matches
    .filter(match => match.score >= (options.relevanceThreshold || 0.6))
    .map(match => ({
      id: match.id,
      title: match.metadata.title,
      content: match.metadata.content,
      category: match.metadata.category,
      relevanceScore: match.score,
      lastUpdated: new Date(match.metadata.lastUpdated),
      source: match.metadata.source,
      url: match.metadata.url,
      tags: match.metadata.tags,
      metadata: match.metadata
    }));
  
  return results;
}
```

#### **4. Replace Skeleton Functions**

```typescript
// src/ragSystem.ts - Replace skeleton implementation
import { RAGQuery, RAGResult } from './types';

const RAG_API_BASE = process.env.RAG_SYSTEM_URL || 'http://localhost:3001/api/rag';

export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  console.log(`[RAG] Querying knowledge base: "${query.query}"`);
  console.log(`[RAG] Category: ${query.category || 'all'}, Max results: ${query.maxResults || 5}`);
  
  try {
    const response = await fetch(`${RAG_API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RAG_API_TOKEN}` // If needed
      },
      body: JSON.stringify(query)
    });
    
    if (!response.ok) {
      throw new Error(`RAG API error: ${response.status} ${response.statusText}`);
    }
    
    const results: RAGResult[] = await response.json();
    console.log(`[RAG] Retrieved ${results.length} knowledge items`);
    
    return results;
    
  } catch (error) {
    console.error(`[RAG] Error querying knowledge base:`, error);
    // Fallback to empty results instead of throwing
    return [];
  }
}

export async function queryCompanyPolicies(
  policyQuery: string, 
  policyType?: string
): Promise<RAGResult[]> {
  console.log(`[RAG] Querying policies: "${policyQuery}", type: ${policyType || 'all'}`);
  
  try {
    const response = await fetch(`${RAG_API_BASE}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyQuery, policyType })
    });
    
    if (!response.ok) {
      throw new Error(`RAG Policy API error: ${response.status}`);
    }
    
    const results: RAGResult[] = await response.json();
    console.log(`[RAG] Retrieved ${results.length} policy documents`);
    
    return results;
    
  } catch (error) {
    console.error(`[RAG] Error querying policies:`, error);
    return [];
  }
}

// Continue with other functions...
```

### **🚀 Phase 2: Advanced Features**

#### **1. Hybrid Search Implementation**

```typescript
// services/hybridSearch.ts
export async function hybridSearch(
  query: string,
  options: {
    semanticWeight?: number; // 0-1, default 0.7
    keywordWeight?: number;  // 0-1, default 0.3
    category?: string;
    maxResults?: number;
  }
): Promise<RAGResult[]> {
  
  const semanticWeight = options.semanticWeight || 0.7;
  const keywordWeight = options.keywordWeight || 0.3;
  
  // Semantic search using embeddings
  const semanticResults = await semanticSearch(query, options);
  
  // Keyword search using full-text search
  const keywordResults = await keywordSearch(query, options);
  
  // Combine and re-rank results
  const combinedResults = combineResults(
    semanticResults, 
    keywordResults, 
    semanticWeight, 
    keywordWeight
  );
  
  return combinedResults.slice(0, options.maxResults || 5);
}
```

#### **2. Smart Contextual Queries**

```typescript
// services/contextualAnalysis.ts
export async function generateContextualQueries(
  emailContent: string,
  includeCategories: string[] = ['policy', 'knowledge', 'procedure']
): Promise<RAGResult[]> {
  
  // Use LLM to extract key concepts
  const keyQueries = await extractKeyQueries(emailContent);
  
  // Execute multiple searches in parallel
  const searchPromises = keyQueries.map(query => 
    searchKnowledge(query, { 
      category: 'all',
      maxResults: 2,
      relevanceThreshold: 0.7 
    })
  );
  
  const allResults = await Promise.all(searchPromises);
  
  // Deduplicate and rank by relevance
  const uniqueResults = deduplicateResults(allResults.flat());
  
  return uniqueResults.slice(0, 10); // Top 10 most relevant
}

async function extractKeyQueries(emailContent: string): Promise<string[]> {
  // Use OpenAI to extract key search queries from email content
  const prompt = `
    Extract 3-5 key search queries from this customer email that would help find relevant company knowledge:
    
    Email: ${emailContent}
    
    Return only the search queries, one per line:
  `;
  
  // Call OpenAI API and parse response
  // Implementation depends on your OpenAI integration
}
```

#### **3. Real-time Content Updates**

```typescript
// services/contentIndexing.ts
export async function indexDocument(
  document: {
    id: string;
    title: string;
    content: string;
    category: string;
    source: string;
    tags?: string[];
    metadata?: Record<string, any>;
  }
): Promise<void> {
  
  console.log(`[RAG-Indexing] Indexing document: ${document.title}`);
  
  // Generate embedding
  const embedding = await getEmbedding(document.content);
  
  // Create chunks for long documents
  const chunks = chunkDocument(document.content, 500); // 500 words per chunk
  
  // Index each chunk
  const vectors = chunks.map((chunk, index) => ({
    id: `${document.id}-chunk-${index}`,
    values: embedding,
    metadata: {
      ...document,
      chunk: chunk,
      chunkIndex: index,
      lastUpdated: new Date().toISOString()
    }
  }));
  
  await index.upsert(vectors);
  
  console.log(`[RAG-Indexing] Indexed ${chunks.length} chunks for document ${document.id}`);
}

export async function updateKnowledgeBase(documents: Document[]): Promise<void> {
  console.log(`[RAG-Indexing] Updating knowledge base with ${documents.length} documents`);
  
  for (const document of documents) {
    await indexDocument(document);
  }
  
  console.log(`[RAG-Indexing] Knowledge base update completed`);
}
```

---

## API Specifications

### **🔌 Required Endpoints**

#### **POST /api/rag/search**
```typescript
// Request
interface RAGSearchRequest {
  query: string;
  category?: 'policy' | 'knowledge' | 'procedure' | 'faq' | 'all';
  maxResults?: number;        // Default: 5
  relevanceThreshold?: number; // Default: 0.6
  includeMetadata?: boolean;   // Default: true
}

// Response
interface RAGSearchResponse {
  results: RAGResult[];
  totalCount: number;
  queryTime: number; // milliseconds
}
```

#### **POST /api/rag/policies**
```typescript
// Request
interface PolicySearchRequest {
  policyQuery: string;
  policyType?: 'refund' | 'privacy' | 'terms' | 'shipping' | 'support';
}

// Response
interface PolicySearchResponse {
  results: RAGResult[];
}
```

#### **POST /api/rag/procedures**
```typescript
// Request
interface ProcedureSearchRequest {
  procedureQuery: string;
  issueType?: 'technical' | 'billing' | 'shipping' | 'account' | 'general';
}
```

#### **POST /api/rag/faq**
```typescript
// Request
interface FAQSearchRequest {
  faqQuery: string;
}
```

#### **POST /api/rag/contextual**
```typescript
// Request
interface ContextualSearchRequest {
  emailContent: string;
  includeCategories?: string[];
}
```

### **📊 Response Format**

All endpoints should return results in this format:

```typescript
interface RAGResult {
  id: string;                    // Unique identifier
  title: string;                 // Document/section title
  content: string;               // Relevant content
  category: 'policy' | 'knowledge' | 'procedure' | 'faq' | 'other';
  relevanceScore: number;        // 0-1 confidence score
  lastUpdated: Date;            // When content was last updated
  source: string;               // Source document/system
  url?: string;                 // Link to full document
  tags?: string[];              // Content tags
  metadata?: Record<string, any>; // Additional metadata
}
```

---

## Database Schema

### **📊 Recommended Tables**

#### **Knowledge Documents**
```sql
CREATE TABLE knowledge_documents (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  category ENUM('policy', 'knowledge', 'procedure', 'faq', 'other') NOT NULL,
  source VARCHAR(255) NOT NULL,
  url TEXT,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSON,
  
  INDEX idx_category (category),
  INDEX idx_source (source),
  INDEX idx_updated (updated_at),
  FULLTEXT idx_content (title, content)
);
```

#### **Document Chunks (for vector storage)**
```sql
CREATE TABLE document_chunks (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding_id VARCHAR(255), -- Reference to vector DB
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES knowledge_documents(id),
  INDEX idx_document (document_id),
  INDEX idx_embedding (embedding_id)
);
```

#### **Search Analytics**
```sql
CREATE TABLE search_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  query TEXT NOT NULL,
  category VARCHAR(50),
  results_count INT,
  query_time_ms INT,
  top_result_id VARCHAR(255),
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_query_time (created_at),
  INDEX idx_category (category)
);
```

---

## Vector Database Setup

### **🔧 Pinecone Setup Example**

```typescript
// scripts/setupPinecone.ts
import { Pinecone } from '@pinecone-database/pinecone';

async function setupPinecone() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  
  // Create index
  await pinecone.createIndex({
    name: 'support-knowledge',
    dimension: 3072, // text-embedding-3-large dimension
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-east-1'
      }
    }
  });
  
  console.log('Pinecone index created successfully');
}
```

### **🔧 Weaviate Setup Example**

```typescript
// scripts/setupWeaviate.ts
import weaviate from 'weaviate-ts-client';

async function setupWeaviate() {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
  });
  
  // Define schema
  const schema = {
    class: 'SupportKnowledge',
    description: 'Company knowledge for customer support',
    vectorizer: 'text2vec-openai',
    properties: [
      {
        name: 'title',
        dataType: ['text'],
        description: 'Document title'
      },
      {
        name: 'content', 
        dataType: ['text'],
        description: 'Document content'
      },
      {
        name: 'category',
        dataType: ['text'],
        description: 'Content category'
      },
      {
        name: 'source',
        dataType: ['text'],
        description: 'Source document'
      },
      {
        name: 'lastUpdated',
        dataType: ['date'],
        description: 'Last update timestamp'
      }
    ]
  };
  
  await client.schema.classCreator().withClass(schema).do();
  console.log('Weaviate schema created successfully');
}
```

---

## Content Indexing

### **📚 Document Processing Pipeline**

```typescript
// services/documentProcessor.ts
export class DocumentProcessor {
  
  async processDocument(filePath: string, metadata: DocumentMetadata): Promise<void> {
    console.log(`[DocProcessor] Processing: ${filePath}`);
    
    // 1. Extract text content
    const content = await this.extractContent(filePath);
    
    // 2. Clean and normalize
    const cleanContent = this.cleanContent(content);
    
    // 3. Chunk into manageable pieces
    const chunks = this.chunkContent(cleanContent, 500);
    
    // 4. Generate embeddings
    const embeddings = await this.generateEmbeddings(chunks);
    
    // 5. Index in vector database
    await this.indexChunks(chunks, embeddings, metadata);
    
    console.log(`[DocProcessor] Indexed ${chunks.length} chunks from ${filePath}`);
  }
  
  private async extractContent(filePath: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return await this.extractPDFContent(filePath);
      case '.docx':
        return await this.extractDocxContent(filePath);
      case '.md':
        return await fs.readFile(filePath, 'utf-8');
      case '.txt':
        return await fs.readFile(filePath, 'utf-8');
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }
  
  private chunkContent(content: string, chunkSize: number): string[] {
    // Split content into meaningful chunks
    const sentences = content.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '. ';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
```

### **🔄 Automated Content Updates**

```typescript
// services/contentWatcher.ts
import chokidar from 'chokidar';

export class ContentWatcher {
  private processor: DocumentProcessor;
  
  constructor() {
    this.processor = new DocumentProcessor();
  }
  
  startWatching(contentDirectory: string): void {
    console.log(`[ContentWatcher] Watching directory: ${contentDirectory}`);
    
    const watcher = chokidar.watch(contentDirectory, {
      ignored: /^\./, // Ignore hidden files
      persistent: true
    });
    
    watcher
      .on('add', (path) => this.handleFileChange(path, 'added'))
      .on('change', (path) => this.handleFileChange(path, 'modified'))
      .on('unlink', (path) => this.handleFileDelete(path));
  }
  
  private async handleFileChange(filePath: string, action: string): Promise<void> {
    try {
      console.log(`[ContentWatcher] File ${action}: ${filePath}`);
      
      const metadata = {
        source: path.basename(filePath),
        category: this.inferCategory(filePath),
        lastUpdated: new Date()
      };
      
      await this.processor.processDocument(filePath, metadata);
      
    } catch (error) {
      console.error(`[ContentWatcher] Error processing ${filePath}:`, error);
    }
  }
  
  private inferCategory(filePath: string): string {
    const pathLower = filePath.toLowerCase();
    
    if (pathLower.includes('policy')) return 'policy';
    if (pathLower.includes('procedure') || pathLower.includes('howto')) return 'procedure';
    if (pathLower.includes('faq')) return 'faq';
    
    return 'knowledge';
  }
}
```

---

## Performance Optimization

### **⚡ Caching Strategy**

```typescript
// services/ragCache.ts
import Redis from 'ioredis';

export class RAGCache {
  private redis: Redis;
  private cacheTTL = 3600; // 1 hour
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async get(query: string, category?: string): Promise<RAGResult[] | null> {
    const key = this.getCacheKey(query, category);
    const cached = await this.redis.get(key);
    
    if (cached) {
      console.log(`[RAG-Cache] Cache hit for query: ${query}`);
      return JSON.parse(cached);
    }
    
    return null;
  }
  
  async set(query: string, results: RAGResult[], category?: string): Promise<void> {
    const key = this.getCacheKey(query, category);
    await this.redis.setex(key, this.cacheTTL, JSON.stringify(results));
    console.log(`[RAG-Cache] Cached results for query: ${query}`);
  }
  
  private getCacheKey(query: string, category?: string): string {
    const hash = crypto.createHash('md5').update(query).digest('hex');
    return `rag:${category || 'all'}:${hash}`;
  }
}
```

### **📊 Performance Monitoring**

```typescript
// middleware/ragMetrics.ts
export class RAGMetrics {
  static async trackQuery(
    query: string,
    category: string,
    resultCount: number,
    queryTime: number
  ): Promise<void> {
    
    // Log to database
    await db.query(`
      INSERT INTO search_analytics 
      (query, category, results_count, query_time_ms, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [query, category, resultCount, queryTime]);
    
    // Log to console
    console.log(`[RAG-Metrics] Query: "${query}" | Category: ${category} | Results: ${resultCount} | Time: ${queryTime}ms`);
    
    // Alert on slow queries
    if (queryTime > 5000) {
      console.warn(`[RAG-Metrics] SLOW QUERY ALERT: ${queryTime}ms for "${query}"`);
    }
  }
}
```

---

## Testing & Validation

### **🧪 Test Suite**

```typescript
// tests/rag.test.ts
import { queryCompanyKnowledge, queryCompanyPolicies } from '../src/ragSystem';

describe('RAG Integration Tests', () => {
  
  test('should retrieve relevant knowledge for billing query', async () => {
    const query = {
      query: 'refund policy for premium subscriptions',
      category: 'policy' as const,
      maxResults: 5,
      relevanceThreshold: 0.7
    };
    
    const results = await queryCompanyKnowledge(query);
    
    expect(results).toHaveLength(expect.any(Number));
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('content');
    expect(results[0]).toHaveProperty('relevanceScore');
    expect(results[0].relevanceScore).toBeGreaterThan(0.7);
  });
  
  test('should return empty array for irrelevant queries', async () => {
    const query = {
      query: 'how to bake a cake',
      category: 'policy' as const,
      relevanceThreshold: 0.8
    };
    
    const results = await queryCompanyKnowledge(query);
    expect(results).toHaveLength(0);
  });
  
  test('should handle API errors gracefully', async () => {
    // Mock API failure
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));
    
    const query = {
      query: 'test query',
      category: 'all' as const
    };
    
    const results = await queryCompanyKnowledge(query);
    expect(results).toEqual([]); // Should return empty array, not throw
  });
});
```

### **📋 Validation Checklist**

- [ ] **Relevance Testing**: Query results match expected topics
- [ ] **Performance Testing**: Sub-3-second response times
- [ ] **Accuracy Testing**: Information is current and correct
- [ ] **Error Handling**: Graceful fallbacks for API failures
- [ ] **Load Testing**: Handle concurrent requests
- [ ] **Content Coverage**: All important topics are indexed
- [ ] **Security Testing**: Proper authentication and authorization

---

## Deployment Considerations

### **🚀 Environment Variables**

```bash
# .env.production
OPENAI_API_KEY=your-openai-key
RAG_SYSTEM_URL=https://your-rag-api.com/api/rag
RAG_API_TOKEN=your-rag-api-token
REDIS_URL=redis://your-redis-instance
PINECONE_API_KEY=your-pinecone-key
VECTOR_INDEX_NAME=support-knowledge-prod
```

### **📊 Monitoring & Alerts**

```typescript
// monitoring/ragMonitoring.ts
export class RAGMonitoring {
  
  static async checkRAGHealth(): Promise<boolean> {
    try {
      // Test query to verify RAG system
      const testQuery = {
        query: 'test health check',
        maxResults: 1
      };
      
      const startTime = Date.now();
      const results = await queryCompanyKnowledge(testQuery);
      const responseTime = Date.now() - startTime;
      
      // Health checks
      const isHealthy = 
        responseTime < 5000 && // Under 5 seconds
        results !== null;      // No errors
      
      console.log(`[RAG-Health] Status: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'} | Response time: ${responseTime}ms`);
      
      return isHealthy;
      
    } catch (error) {
      console.error(`[RAG-Health] Health check failed:`, error);
      return false;
    }
  }
}

// Run health checks every 5 minutes
setInterval(RAGMonitoring.checkRAGHealth, 5 * 60 * 1000);
```

### **🔧 Scaling Considerations**

- **Load Balancing**: Distribute RAG queries across multiple instances
- **Caching**: Implement Redis caching for frequent queries
- **Connection Pooling**: Use connection pools for database access
- **Async Processing**: Handle large content updates asynchronously
- **Rate Limiting**: Prevent abuse of RAG endpoints

---

## Troubleshooting

### **🔧 Common Issues**

#### **Slow Query Performance**
```typescript
// Problem: Queries taking > 5 seconds
// Solutions:
1. Add caching layer (Redis)
2. Optimize vector index settings
3. Reduce embedding dimensions
4. Implement query result pagination
5. Use hybrid search for better relevance
```

#### **Low Relevance Scores**
```typescript
// Problem: Results not relevant to queries
// Solutions:
1. Adjust relevance threshold (lower from 0.7 to 0.5)
2. Improve content chunking strategy
3. Use better embedding model (text-embedding-3-large)
4. Implement hybrid search (semantic + keyword)
5. Clean and normalize content before indexing
```

#### **API Connection Issues**
```typescript
// Problem: RAG API calls failing
// Solutions:
1. Implement retry logic with exponential backoff
2. Add circuit breaker pattern
3. Graceful fallback to cached results
4. Health check monitoring
5. Proper error logging and alerting
```

### **📊 Debug Logging**

```typescript
// Enable detailed RAG logging
const RAG_DEBUG = process.env.RAG_DEBUG === 'true';

function debugLog(message: string, data?: any): void {
  if (RAG_DEBUG) {
    console.log(`[RAG-Debug] ${message}`, data || '');
  }
}

// Usage in RAG functions
export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  debugLog('Starting knowledge query', { query: query.query, category: query.category });
  
  const startTime = Date.now();
  
  try {
    const results = await performSearch(query);
    const queryTime = Date.now() - startTime;
    
    debugLog('Query completed', { 
      resultCount: results.length, 
      queryTime,
      topResult: results[0]?.title 
    });
    
    return results;
    
  } catch (error) {
    debugLog('Query failed', { error: error.message });
    throw error;
  }
}
```

---

## 🎯 Next Steps

1. **Choose your vector database** (Pinecone recommended for simplicity)
2. **Set up backend API** with the required endpoints
3. **Replace skeleton functions** in `src/ragSystem.ts`
4. **Index your company content** using the document processor
5. **Test thoroughly** with real queries and content
6. **Deploy with monitoring** and performance tracking
7. **Iterate and improve** based on usage analytics

### **📞 Support**

For integration questions:
- Review the code examples in this guide
- Check the ProResponse Agent logs for detailed debugging
- Implement health checks and monitoring
- Test with small datasets before full deployment

**🎉 Happy integrating! Your customers will benefit from accurate, consistent AI-powered support responses backed by your company's knowledge.** 