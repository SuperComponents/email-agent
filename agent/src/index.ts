// ProResponse Agent - Enhanced Support Agent Assistant LLM
// Now supports email threads, RAG integration, and automatic thread naming

// Core agent functions
export { assistSupportPersonEnhanced, assistSupportPersonEnhanced as default } from './enhancedAgent';

// Type definitions for enhanced functionality
export {
  // Thread and message types
  EmailMessage,
  Attachment,
  EmailThread,
  
  // Support context types  
  SupportContext,
  CustomerHistory,
  OrderInfo,
  AccountDetails,
  
  // RAG system types
  RAGQuery,
  RAGResult,
  
  // Enhanced response types
  EnhancedAgentResponse,
  AgentConfig,
  
  // Thread naming types
  ThreadNamingRequest,
  ThreadNamingResponse
} from './types';

// RAG system skeleton functions (to be implemented by backend team)
export {
  queryCompanyKnowledge,
  queryCompanyPolicies,
  queryProcedures,
  queryFAQ,
  generateContextualQueries,
  formatRAGResultsForAgent
} from './ragSystem';

// Thread naming skeleton functions
export {
  generateThreadName,
  generateQuickThreadName
} from './threadNaming';

// Enhanced tools and utilities
export { tools, handleToolCall } from './tools';
export { openai } from './openaiClient';

/**
 * Version information and capabilities
 */
export const AGENT_VERSION = '2.0.0';
export const AGENT_CAPABILITIES = {
  threadSupport: true,
  ragIntegration: true,
  threadNaming: true,
  sentimentAnalysis: true,
  escalationDetection: true,
  multipleTools: true,
  skeletonImplementation: true
};

/**
 * Quick start examples for the enhanced agent
 */
export const USAGE_EXAMPLES = {
  basic: `
// Basic usage with email thread
import { assistSupportPersonEnhanced, EmailThread } from 'proresponse-agent';

const thread: EmailThread = {
  id: 'thread-123',
  subject: 'Premium subscription not working',
  messages: [/* email messages */],
  customerEmail: 'customer@example.com',
  status: 'open',
  priority: 'normal',
  createdAt: new Date(),
  updatedAt: new Date()
};

const response = await assistSupportPersonEnhanced(thread);
console.log('Thread Name:', response.threadName);
console.log('Draft:', response.draft);
console.log('RAG Sources:', response.ragSources?.length);
  `,
  
  advanced: `
// Advanced usage with full context and configuration
import { 
  assistSupportPersonEnhanced, 
  EmailThread, 
  SupportContext, 
  AgentConfig 
} from 'proresponse-agent';

const context: SupportContext = {
  customerHistory: {
    customerId: 'cust-456',
    totalTickets: 3,
    resolvedTickets: 2,
    averageResolutionTime: 24,
    satisfactionScore: 4
  },
  orderInformation: [/* order details */],
  escalationLevel: 'none'
};

const config: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  generateThreadName: true,
  maxRAGResults: 5,
  enableSentimentAnalysis: true
};

const response = await assistSupportPersonEnhanced(thread, context, config);
  `,
  
  ragOnly: `
// Using RAG system independently
import { queryCompanyPolicies, RAGQuery } from 'proresponse-agent';

const results = await queryCompanyPolicies('refund policy for premium users');
console.log('Policy results:', results);
  `,
  
  threadNaming: `
// Using thread naming independently
import { generateThreadName, ThreadNamingRequest } from 'proresponse-agent';

const request: ThreadNamingRequest = {
  thread: emailThread,
  maxLength: 50,
  includeIssueType: true
};

const naming = await generateThreadName(request);
console.log('Generated name:', naming.name);
console.log('Confidence:', naming.confidence);
  `
};

/**
 * Migration guide for upgrading from v1.x to v2.x
 */
export const MIGRATION_GUIDE = {
  v1ToV2: `
## Migrating from v1.x to v2.x

### What's New:
- ✅ Email thread support (replaces raw email text)
- ✅ RAG system integration for company knowledge
- ✅ Automatic thread naming (ChatGPT-style)
- ✅ Enhanced sentiment analysis and escalation detection
- ✅ Comprehensive logging and monitoring
- ✅ Multiple specialized tools for different use cases

### Breaking Changes:
1. **Main function signature changed:**
   - OLD: assistSupportPerson(emailText, context, model)
   - NEW: assistSupportPersonEnhanced(thread, context, config)

2. **Input format changed:**
   - OLD: Raw email string
   - NEW: EmailThread object with structured messages

3. **Response format enhanced:**
   - OLD: { draft, reasoning }
   - NEW: { draft, reasoning, threadName, confidence, priority, sentiment, ragSources, ... }

### Migration Steps:
1. Update imports to include new types
2. Convert email text to EmailThread format
3. Update function calls to use new signature
4. Update response handling to use enhanced response format

### Backward Compatibility:
- Use 'assistSupportPersonBasic' for the original v1.x behavior
- Or use the migration utility functions (to be implemented)
  `
};

/**
 * Development and integration notes
 */
export const INTEGRATION_NOTES = {
  ragSystem: `
## RAG System Integration

The RAG (Retrieval-Augmented Generation) system functions are currently skeleton implementations that return mock data. They are ready for integration with your backend RAG system.

### Files to integrate:
- src/ragSystem.ts - Replace mock functions with real backend calls
- src/tools.ts - RAG tools are already wired into the agent

### Expected integration points:
1. Vector database connection
2. Semantic search implementation  
3. Company policy/knowledge indexing
4. Real-time content updates
  `,
  
  backend: `
## Backend Integration

The enhanced agent is designed to work with a backend system that provides:

### Required Backend APIs:
1. **Email Thread API** - Fetch email threads by ID
2. **Customer Context API** - Get customer history, orders, account details
3. **RAG Search API** - Query company knowledge base
4. **Thread Persistence API** - Save thread names and metadata

### Database Schema:
- Email threads and messages
- Customer interaction history
- Company knowledge base (vector database)
- Support agent metadata
  `,
  
  deployment: `
## Deployment Considerations

### Environment Variables:
- OPENAI_API_KEY - Required for LLM functionality
- RAG_SYSTEM_URL - Backend RAG system endpoint (when implemented)
- LOG_LEVEL - Logging verbosity (debug, info, warn, error)

### Performance:
- Thread analysis: ~2-5 seconds per thread
- RAG queries: ~1-3 seconds per query (when implemented)
- Thread naming: ~1-2 seconds per thread

### Monitoring:
- All functions include comprehensive console logging
- Monitor OpenAI API usage and costs
- Track RAG system performance and accuracy
  `
};

/**
 * Example usage:
 * 
 * ```typescript
 * import { assistSupportPersonEnhanced } from 'proresponse-agent';
 * 
 * const response = await assistSupportPersonEnhanced(emailThread, context, config);
 * console.log('Thread Name:', response.threadName);
 * console.log('Draft Response:', response.draft);
 * console.log('Confidence:', response.confidence);
 * console.log('RAG Sources:', response.ragSources?.length);
 * ```
 * 
 * For more examples, see USAGE_EXAMPLES export.
 */ 