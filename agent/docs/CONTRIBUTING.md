# Contributing Guide 🤝

**Welcome to ProResponse Agent! We're excited to have you contribute to making customer support AI more powerful and accessible.**

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Contributing Areas](#contributing-areas)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Performance Considerations](#performance-considerations)
- [Security Guidelines](#security-guidelines)
- [Community](#community)

---

## Getting Started

### **🎯 Ways to Contribute**

- **🐛 Bug Reports** - Help us identify and fix issues
- **✨ Feature Requests** - Suggest new capabilities
- **📝 Documentation** - Improve guides and examples
- **🔧 Code Contributions** - Add features or fix bugs
- **🧪 Testing** - Write tests and improve coverage
- **🚀 Performance** - Optimize speed and memory usage
- **🌍 Integrations** - Add support for new systems

### **📞 Before You Start**

1. **Check existing issues** - Someone might already be working on it
2. **Read the documentation** - Understand the architecture and patterns
3. **Join discussions** - Get context and avoid duplicate work
4. **Start small** - Begin with documentation or small fixes

---

## Development Setup

### **🔧 Prerequisites**

- **Node.js** 18+ (LTS recommended)
- **TypeScript** 5.0+
- **Git** for version control
- **OpenAI API Key** for testing

### **⚡ Quick Setup**

```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/proresponse-agent.git
cd proresponse-agent/agent

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key

# 4. Build and test
npm run build
npm run test

# 5. Run examples to verify setup
npm run example:enhanced
```

### **📁 Project Structure**

```
agent/
├── src/
│   ├── agent.ts              # Original v1.x agent (compatibility)
│   ├── enhancedAgent.ts      # Enhanced v2.0.0 agent
│   ├── ragSystem.ts          # RAG integration skeleton
│   ├── threadNaming.ts       # Thread naming system
│   ├── tools.ts              # Agent tools (10 tools)
│   ├── types.ts              # TypeScript interfaces
│   ├── openaiClient.ts       # OpenAI SDK wrapper
│   └── index.ts              # Main exports
├── docs/                     # Documentation
├── examples/                 # Usage examples
├── tests/                    # Test suites
├── dist/                     # Compiled JavaScript
├── package.json              # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### **🎯 Development Workflow**

```bash
# Start development mode (watch compilation)
npm run dev

# Run tests with watch mode
npm run test:watch

# Check code style
npm run lint

# Fix formatting
npm run format

# Build for production
npm run build

# Run examples
npm run example         # Basic example
npm run example:enhanced # Enhanced example
```

---

## Code Style Guidelines

### **📝 TypeScript First**

**Always use TypeScript** with full type safety:

```typescript
// ✅ Good: Full type safety
interface CustomerData {
  email: string;
  name: string;
  priority: 'low' | 'normal' | 'high';
}

function processCustomer(data: CustomerData): Promise<AgentResponse> {
  // Implementation
}

// ❌ Bad: Using any or missing types
function processCustomer(data: any): any {
  // Implementation
}
```

### **🏷️ Comprehensive Logging**

**Use structured logging** with module prefixes:

```typescript
// ✅ Good: Structured logging with context
console.log(`[RAG] Querying knowledge base: "${query}"`);
console.log(`[RAG] Retrieved ${results.length} results in ${duration}ms`);
console.log(`[ThreadNaming] Generated name: "${threadName}" (confidence: ${confidence})`);

// ❌ Bad: Unclear or missing logging
console.log('Found stuff');
console.log(results);
```

### **🔧 Error Handling**

**Always handle errors gracefully** with informative messages:

```typescript
// ✅ Good: Comprehensive error handling
export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  console.log(`[RAG] Starting knowledge query: "${query.query}"`);
  
  try {
    const response = await fetch(ragEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (!response.ok) {
      throw new Error(`RAG API error: ${response.status} ${response.statusText}`);
    }
    
    const results: RAGResult[] = await response.json();
    console.log(`[RAG] Successfully retrieved ${results.length} results`);
    
    return results;
    
  } catch (error) {
    console.error(`[RAG] Knowledge query failed:`, error);
    console.log(`[RAG] Returning empty results as fallback`);
    
    // Graceful fallback instead of throwing
    return [];
  }
}

// ❌ Bad: Poor error handling
export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  const response = await fetch(ragEndpoint, { body: JSON.stringify(query) });
  return response.json(); // No error handling
}
```

### **📚 Documentation Standards**

**Use JSDoc for all public functions**:

```typescript
/**
 * Generate a descriptive thread name for an email conversation
 * 
 * @param request - Thread naming configuration and preferences
 * @returns Promise resolving to comprehensive naming analysis
 * @throws {ValidationError} When thread data is invalid
 * @throws {OpenAIError} When AI analysis fails
 * 
 * @example
 * ```typescript
 * const naming = await generateThreadName({
 *   thread: emailThread,
 *   maxLength: 50,
 *   includeCustomerName: false
 * });
 * console.log(`Generated: ${naming.name} (${naming.confidence} confidence)`);
 * ```
 */
export async function generateThreadName(
  request: ThreadNamingRequest
): Promise<ThreadNamingResponse> {
  // Implementation
}
```

### **🎯 Function Design Principles**

1. **Single Responsibility** - Each function does one thing well
2. **Pure Functions** - Avoid side effects when possible
3. **Descriptive Names** - Function names clearly indicate purpose
4. **Consistent Patterns** - Follow established project patterns
5. **Type Safety** - Full TypeScript coverage

```typescript
// ✅ Good: Clear, focused function
export async function detectCustomerSentiment(
  emailContent: string
): Promise<SentimentAnalysis> {
  console.log(`[Sentiment] Analyzing email content (${emailContent.length} chars)`);
  
  // Single responsibility: analyze sentiment
  const analysis = await performSentimentAnalysis(emailContent);
  
  console.log(`[Sentiment] Detected: ${analysis.sentiment} (confidence: ${analysis.confidence})`);
  return analysis;
}

// ❌ Bad: Multiple responsibilities
export async function processEmailAndDoEverything(data: any): Promise<any> {
  // Processes email, analyzes sentiment, generates names, queries RAG, etc.
}
```

---

## Contributing Areas

### **🧠 RAG System Integration**

**Help implement real RAG backends** to replace skeleton functions:

```typescript
// areas/rag-integration/
├── backends/
│   ├── pinecone.ts           # Pinecone vector database
│   ├── weaviate.ts           # Weaviate integration
│   ├── chromadb.ts           # ChromaDB support
│   └── postgresql.ts         # PostgreSQL + pgvector
├── embeddings/
│   ├── openai.ts             # OpenAI embeddings
│   ├── cohere.ts             # Cohere embeddings
│   └── huggingface.ts        # Hugging Face models
└── search/
    ├── semantic.ts           # Semantic search
    ├── hybrid.ts             # Hybrid (semantic + keyword)
    └── reranking.ts          # Result re-ranking
```

**Example Contribution:**
```typescript
// New file: src/backends/pinecone.ts
import { Pinecone } from '@pinecone-database/pinecone';
import { RAGQuery, RAGResult } from '../types';

export class PineconeRAGBackend {
  private pinecone: Pinecone;
  private index: any;
  
  constructor(apiKey: string, indexName: string) {
    this.pinecone = new Pinecone({ apiKey });
    this.index = this.pinecone.index(indexName);
  }
  
  async search(query: RAGQuery): Promise<RAGResult[]> {
    console.log(`[Pinecone] Searching for: "${query.query}"`);
    
    // Generate embedding
    const embedding = await this.getEmbedding(query.query);
    
    // Search vector database
    const searchResults = await this.index.query({
      vector: embedding,
      topK: query.maxResults || 5,
      includeMetadata: true,
      filter: query.category ? { category: query.category } : undefined
    });
    
    // Convert to standard format
    const results = searchResults.matches.map(match => ({
      id: match.id,
      title: match.metadata.title,
      content: match.metadata.content,
      category: match.metadata.category,
      relevanceScore: match.score,
      lastUpdated: new Date(match.metadata.lastUpdated),
      source: match.metadata.source,
      url: match.metadata.url,
      tags: match.metadata.tags || [],
      metadata: match.metadata
    }));
    
    console.log(`[Pinecone] Found ${results.length} results`);
    return results;
  }
  
  private async getEmbedding(text: string): Promise<number[]> {
    // Implementation for generating embeddings
  }
}
```

### **🏷️ Thread Naming Enhancements**

**Improve automatic thread naming** with better AI prompts and techniques:

```typescript
// areas/thread-naming/
├── strategies/
│   ├── chatgpt-style.ts      # ChatGPT-like naming
│   ├── issue-focused.ts      # Issue-type focused names
│   ├── customer-focused.ts   # Customer-centric names
│   └── multilingual.ts       # Multi-language support
├── analysis/
│   ├── topic-extraction.ts   # Extract key topics
│   ├── urgency-detection.ts  # Detect urgency levels
│   └── sentiment-aware.ts    # Sentiment-aware naming
└── templates/
    ├── business.ts           # Business-friendly templates
    ├── technical.ts          # Technical support templates
    └── casual.ts             # Casual/friendly templates
```

### **🔧 Tool Development**

**Add new specialized tools** for the agent:

```typescript
// Example new tool: Customer Risk Assessment
export const customerRiskAssessmentTool = {
  type: 'function' as const,
  function: {
    name: 'assess_customer_risk',
    description: 'Assess customer churn risk and lifetime value',
    parameters: {
      type: 'object',
      properties: {
        customerHistory: {
          type: 'string',
          description: 'JSON string of customer history data'
        },
        currentIssue: {
          type: 'string',
          description: 'Description of current support issue'
        }
      },
      required: ['customerHistory', 'currentIssue']
    }
  }
};

// Handler implementation
case 'assess_customer_risk':
  return await assessCustomerRisk(args.customerHistory, args.currentIssue);
  
async function assessCustomerRisk(
  customerHistoryJson: string, 
  currentIssue: string
): Promise<string> {
  console.log(`[CustomerRisk] Assessing churn risk for current issue`);
  
  try {
    const history = JSON.parse(customerHistoryJson);
    
    // Risk factors
    const riskFactors = {
      lowSatisfaction: history.satisfactionScore < 3.0,
      frequentTickets: history.totalTickets > 10,
      recentEscalations: history.recentEscalations > 2,
      billingIssues: currentIssue.toLowerCase().includes('billing'),
      cancellationSignals: /cancel|unsubscribe|leave/i.test(currentIssue)
    };
    
    const riskScore = Object.values(riskFactors).filter(Boolean).length / Object.keys(riskFactors).length;
    
    const assessment = {
      riskLevel: riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low',
      riskScore: riskScore,
      keyFactors: Object.entries(riskFactors).filter(([_, value]) => value).map(([key]) => key),
      recommendations: generateRetentionRecommendations(riskScore, riskFactors)
    };
    
    console.log(`[CustomerRisk] Risk level: ${assessment.riskLevel} (score: ${riskScore})`);
    
    return JSON.stringify(assessment, null, 2);
    
  } catch (error) {
    console.error(`[CustomerRisk] Assessment failed:`, error);
    return JSON.stringify({ error: 'Risk assessment failed', riskLevel: 'unknown' });
  }
}
```

### **📊 Analytics & Metrics**

**Add analytics and performance monitoring**:

```typescript
// areas/analytics/
├── performance/
│   ├── response-times.ts     # Track response times
│   ├── token-usage.ts        # Monitor token consumption
│   └── cache-efficiency.ts   # Cache hit rates
├── quality/
│   ├── confidence-tracking.ts # Track agent confidence
│   ├── escalation-accuracy.ts # Escalation prediction accuracy
│   └── sentiment-accuracy.ts  # Sentiment detection accuracy
└── usage/
    ├── feature-adoption.ts   # Feature usage statistics
    ├── error-tracking.ts     # Error rates and types
    └── user-patterns.ts      # Usage pattern analysis
```

### **🌍 Internationalization**

**Add multi-language support**:

```typescript
// areas/i18n/
├── languages/
│   ├── spanish.ts            # Spanish support responses
│   ├── french.ts             # French support responses
│   ├── german.ts             # German support responses
│   └── portuguese.ts         # Portuguese support responses
├── detection/
│   ├── language-detection.ts # Auto-detect customer language
│   └── confidence-scoring.ts # Language detection confidence
└── translation/
    ├── response-translation.ts # Translate responses
    └── context-translation.ts  # Translate context
```

---

## Pull Request Process

### **📋 Before Submitting**

1. **Create an issue first** (unless it's a tiny fix)
2. **Follow code style guidelines**
3. **Add comprehensive tests**
4. **Update documentation**
5. **Verify all examples still work**

### **🔄 Pull Request Template**

```markdown
## 🎯 Description
Brief description of what this PR does and why.

## 📋 Type of Change
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] 🔧 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement

## 🧪 Testing
- [ ] Existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] Examples verified to work

## 📝 Documentation
- [ ] Code comments added/updated
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Migration guide updated (if breaking change)

## 🔍 Code Quality
- [ ] TypeScript compilation passes
- [ ] Linting passes
- [ ] Code follows project style guidelines
- [ ] Comprehensive error handling added
- [ ] Logging statements included

## 📊 Performance Impact
- [ ] No performance regression
- [ ] Performance improvement (describe below)
- [ ] Performance impact assessed and acceptable

## 🎯 Related Issues
Closes #issue_number

## 📸 Screenshots (if applicable)
```

### **✅ Review Checklist**

**For Reviewers:**

- [ ] **Code Quality** - Follows style guidelines and best practices
- [ ] **Type Safety** - Full TypeScript coverage
- [ ] **Error Handling** - Graceful error handling with fallbacks
- [ ] **Logging** - Comprehensive logging with appropriate levels
- [ ] **Testing** - Adequate test coverage for new functionality
- [ ] **Documentation** - Code is well-documented
- [ ] **Performance** - No significant performance regression
- [ ] **Security** - No security vulnerabilities introduced
- [ ] **Backward Compatibility** - Maintains compatibility (unless breaking change)

---

## Testing Guidelines

### **🧪 Testing Strategy**

We use a multi-layered testing approach:

1. **Unit Tests** - Individual function testing
2. **Integration Tests** - Component interaction testing
3. **E2E Tests** - Full workflow testing
4. **Performance Tests** - Speed and memory testing
5. **Manual Tests** - Real-world scenario testing

### **📝 Writing Tests**

```typescript
// tests/ragSystem.test.ts
import { queryCompanyKnowledge } from '../src/ragSystem';
import { RAGQuery } from '../src/types';

describe('RAG System', () => {
  describe('queryCompanyKnowledge', () => {
    
    it('should return relevant results for valid queries', async () => {
      // Arrange
      const query: RAGQuery = {
        query: 'refund policy for premium subscriptions',
        category: 'policy',
        maxResults: 5,
        relevanceThreshold: 0.7
      };
      
      // Act
      const results = await queryCompanyKnowledge(query);
      
      // Assert
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
      
      // Check result structure
      results.forEach(result => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('relevanceScore');
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0.7);
        expect(result.category).toBe('policy');
      });
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock API failure
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));
      
      const query: RAGQuery = {
        query: 'test query',
        category: 'knowledge'
      };
      
      // Should not throw, should return empty array
      const results = await queryCompanyKnowledge(query);
      expect(results).toEqual([]);
    });
    
    it('should filter results by relevance threshold', async () => {
      const query: RAGQuery = {
        query: 'billing information',
        relevanceThreshold: 0.9 // High threshold
      };
      
      const results = await queryCompanyKnowledge(query);
      
      results.forEach(result => {
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0.9);
      });
    });
  });
});
```

### **⚡ Performance Tests**

```typescript
// tests/performance.test.ts
describe('Performance Tests', () => {
  
  it('should complete thread analysis within 10 seconds', async () => {
    const startTime = Date.now();
    
    const response = await assistSupportPersonEnhanced(sampleThread);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000); // 10 seconds
  });
  
  it('should handle batch processing efficiently', async () => {
    const threads = Array.from({ length: 5 }, createSampleThread);
    
    const startTime = Date.now();
    const results = await Promise.all(
      threads.map(thread => assistSupportPersonEnhanced(thread))
    );
    const duration = Date.now() - startTime;
    
    expect(results).toHaveLength(5);
    expect(duration).toBeLessThan(30000); // 30 seconds for 5 threads
  });
});
```

### **🔧 Test Utilities**

```typescript
// tests/utils/testHelpers.ts
export function createSampleThread(overrides?: Partial<EmailThread>): EmailThread {
  return {
    id: 'test-thread-' + Math.random().toString(36).substr(2, 9),
    subject: 'Test Support Issue',
    customerEmail: 'test@customer.com',
    status: 'open',
    priority: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: 'test-msg-1',
        threadId: 'test-thread',
        from: 'test@customer.com',
        to: ['support@company.com'],
        subject: 'Test Support Issue',
        body: 'I need help with my account',
        timestamp: new Date(),
        isFromCustomer: true
      }
    ],
    ...overrides
  };
}

export function createSampleContext(overrides?: Partial<SupportContext>): SupportContext {
  return {
    customerHistory: {
      customerId: 'test-customer',
      totalTickets: 3,
      resolvedTickets: 2,
      averageResolutionTime: 24,
      satisfactionScore: 4.0
    },
    accountDetails: {
      customerId: 'test-customer',
      email: 'test@customer.com',
      name: 'Test Customer',
      accountType: 'basic',
      subscriptionStatus: 'active',
      joinDate: new Date('2023-01-01'),
      billingStatus: 'current'
    },
    ...overrides
  };
}
```

---

## Documentation Standards

### **📚 Documentation Types**

1. **Code Documentation** - JSDoc comments in source code
2. **API Documentation** - Function signatures and examples
3. **User Guides** - How-to guides for different use cases
4. **Integration Guides** - Backend integration instructions
5. **Examples** - Working code examples

### **✍️ Writing Style**

- **Clear and Concise** - Easy to understand explanations
- **Example-Driven** - Include working code examples
- **Comprehensive** - Cover all parameters and edge cases
- **Up-to-Date** - Keep documentation current with code changes

### **📝 Documentation Template**

```typescript
/**
 * Brief one-line description of the function
 * 
 * Longer description explaining what this function does,
 * when to use it, and any important considerations.
 * 
 * @param paramName - Description of parameter and its constraints
 * @param optionalParam - Description of optional parameter (optional)
 * @returns Description of return value and its structure
 * @throws {ErrorType} Description of when this error is thrown
 * 
 * @example Basic usage:
 * ```typescript
 * const result = await functionName(param1, param2);
 * console.log(result.property);
 * ```
 * 
 * @example Advanced usage:
 * ```typescript
 * const config = { option: true };
 * const result = await functionName(param1, param2, config);
 * ```
 * 
 * @see {@link RelatedFunction} for related functionality
 * @since 2.0.0
 */
export async function functionName(
  paramName: ParamType,
  optionalParam?: OptionalType
): Promise<ReturnType> {
  // Implementation
}
```

---

## Performance Considerations

### **⚡ Performance Guidelines**

1. **Response Times** - Keep under 10 seconds for typical requests
2. **Memory Usage** - Monitor memory consumption in batch operations
3. **Token Efficiency** - Optimize prompts to minimize token usage
4. **Caching** - Cache expensive operations (embeddings, analysis)
5. **Parallel Processing** - Use Promise.all for independent operations

### **📊 Performance Monitoring**

```typescript
// Add performance monitoring to contributions
export async function monitoredFunction<T>(
  functionName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    console.log(`[Performance] ${functionName} completed in ${duration}ms`);
    console.log(`[Performance] Memory delta: ${(endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024}MB`);
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Performance] ${functionName} failed after ${duration}ms:`, error);
    throw error;
  }
}

// Usage in contributions
export async function myNewFeature(input: InputType): Promise<OutputType> {
  return await monitoredFunction('myNewFeature', async () => {
    // Implementation
  });
}
```

---

## Security Guidelines

### **🔒 Security Best Practices**

1. **Input Validation** - Validate all inputs thoroughly
2. **API Key Protection** - Never log or expose API keys
3. **Sanitization** - Sanitize user input to prevent injection
4. **Error Information** - Don't expose sensitive data in errors
5. **Dependencies** - Keep dependencies updated and secure

### **🛡️ Security Checklist**

```typescript
// ✅ Good: Secure input validation
export async function secureFunction(userInput: string): Promise<Result> {
  // Validate input
  if (!userInput || typeof userInput !== 'string') {
    throw new Error('Invalid input: string required');
  }
  
  if (userInput.length > 10000) {
    throw new Error('Input too long: maximum 10,000 characters');
  }
  
  // Sanitize input
  const sanitizedInput = userInput
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 5000);   // Limit length
  
  // Process safely
  return await processInput(sanitizedInput);
}

// ❌ Bad: No validation or sanitization
export async function insecureFunction(userInput: any): Promise<any> {
  return await processInput(userInput); // Direct processing
}
```

---

## Community

### **💬 Communication Channels**

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Pull Requests** - Code reviews and collaboration

### **🤝 Code of Conduct**

We are committed to providing a welcoming and inclusive environment:

- **Be Respectful** - Treat all contributors with respect
- **Be Constructive** - Provide helpful feedback and suggestions
- **Be Patient** - Remember that people have different experience levels
- **Be Collaborative** - Work together to improve the project

### **🎯 Recognition**

Contributors will be recognized through:

- **Contributor List** - Added to project contributors
- **Release Notes** - Mentioned in release announcements
- **Documentation** - Credited in relevant documentation

---

## 🚀 Getting Started Checklist

Ready to contribute? Follow this checklist:

- [ ] **Read this contributing guide** completely
- [ ] **Set up development environment** with all prerequisites
- [ ] **Run existing tests** to ensure everything works
- [ ] **Try the examples** to understand the system
- [ ] **Find an issue** or create one for your contribution
- [ ] **Start small** with documentation or bug fixes
- [ ] **Write tests** for any new functionality
- [ ] **Update documentation** for your changes
- [ ] **Submit a pull request** following the template

---

**🎉 Thank you for contributing to ProResponse Agent!**

Your contributions help make AI-powered customer support more accessible and effective for teams everywhere. Whether you're fixing a typo or implementing a major feature, every contribution matters and is appreciated.

**Questions?** Don't hesitate to open a GitHub issue or discussion. We're here to help and excited to see what you'll build! 