# API Reference v2.0.0 📚

**Complete API documentation for ProResponse Agent v2.0.0 Enhanced**

---

## 📋 Table of Contents

- [Core Functions](#core-functions)
- [RAG System Functions](#rag-system-functions)
- [Thread Naming Functions](#thread-naming-functions)
- [Utility Functions](#utility-functions)
- [Type Definitions](#type-definitions)
- [Configuration Options](#configuration-options)
- [Tool Functions](#tool-functions)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Core Functions

### **`assistSupportPersonEnhanced`**

**Main enhanced agent function with full v2.0.0 capabilities.**

```typescript
function assistSupportPersonEnhanced(
  thread: EmailThread,
  context?: SupportContext,
  config?: AgentConfig
): Promise<EnhancedAgentResponse>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread` | `EmailThread` | ✅ Yes | Complete email conversation thread |
| `context` | `SupportContext` | ❌ No | Customer history and support context |
| `config` | `AgentConfig` | ❌ No | Agent configuration options |

#### **Returns**

`Promise<EnhancedAgentResponse>` - Comprehensive response with metadata

#### **Example**

```typescript
const thread: EmailThread = {
  id: 'thread-123',
  subject: 'Billing Issue',
  customerEmail: 'customer@example.com',
  status: 'open',
  priority: 'high',
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [/* array of messages */]
};

const response = await assistSupportPersonEnhanced(thread);
console.log(response.draft);        // Email response
console.log(response.threadName);   // Generated thread name
console.log(response.confidence);   // Confidence score
```

#### **Throws**

- `Error` - OpenAI API errors or configuration issues
- `TypeError` - Invalid input parameters
- `NetworkError` - Connection issues

---

### **`assistSupportPersonBasic`**

**Original v1.x function for backward compatibility.**

```typescript
function assistSupportPersonBasic(
  customerEmail: string,
  context?: string,
  preferredModel?: string
): Promise<AgentResponse>
```

#### **Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `customerEmail` | `string` | ✅ Yes | - | Raw customer email text |
| `context` | `string` | ❌ No | `''` | Additional context from support person |
| `preferredModel` | `string` | ❌ No | `'gpt-4o'` | OpenAI model to use |

#### **Returns**

`Promise<AgentResponse>` - Basic response with draft and reasoning

#### **Example**

```typescript
const response = await assistSupportPersonBasic(
  "I need help with my order",
  "Premium customer, order #12345"
);
console.log(response.draft);     // Email response
console.log(response.reasoning); // Agent reasoning
```

---

## RAG System Functions

### **`queryCompanyKnowledge`**

**Query the company knowledge base for relevant information.**

```typescript
function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | `RAGQuery` | ✅ Yes | Knowledge query with filters |

#### **RAGQuery Interface**

```typescript
interface RAGQuery {
  query: string;                    // Search query text
  category?: RAGCategory;          // Content category filter
  maxResults?: number;             // Maximum results (default: 5)
  relevanceThreshold?: number;     // Minimum relevance score (default: 0.6)
  includeMetadata?: boolean;       // Include full metadata (default: true)
}

type RAGCategory = 'policy' | 'knowledge' | 'procedure' | 'faq' | 'all';
```

#### **Returns**

`Promise<RAGResult[]>` - Array of relevant knowledge items

#### **Example**

```typescript
const results = await queryCompanyKnowledge({
  query: 'refund policy for premium subscriptions',
  category: 'policy',
  maxResults: 3,
  relevanceThreshold: 0.8
});

console.log(`Found ${results.length} relevant policies`);
results.forEach(result => {
  console.log(`${result.title}: ${result.relevanceScore}`);
});
```

---

### **`queryCompanyPolicies`**

**Search specifically for company policies.**

```typescript
function queryCompanyPolicies(
  policyQuery: string,
  policyType?: PolicyType
): Promise<RAGResult[]>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `policyQuery` | `string` | ✅ Yes | Policy search query |
| `policyType` | `PolicyType` | ❌ No | Specific policy category |

#### **PolicyType**

```typescript
type PolicyType = 'refund' | 'privacy' | 'terms' | 'shipping' | 'support';
```

#### **Example**

```typescript
const refundPolicies = await queryCompanyPolicies(
  'subscription cancellation',
  'refund'
);
```

---

### **`queryProcedures`**

**Search for troubleshooting procedures and guides.**

```typescript
function queryProcedures(
  procedureQuery: string,
  issueType?: IssueType
): Promise<RAGResult[]>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `procedureQuery` | `string` | ✅ Yes | Procedure search query |
| `issueType` | `IssueType` | ❌ No | Type of issue |

#### **IssueType**

```typescript
type IssueType = 'technical' | 'billing' | 'shipping' | 'account' | 'general';
```

#### **Example**

```typescript
const procedures = await queryProcedures(
  'password reset not working',
  'technical'
);
```

---

### **`queryFAQ`**

**Search frequently asked questions.**

```typescript
function queryFAQ(faqQuery: string): Promise<RAGResult[]>
```

#### **Example**

```typescript
const faqs = await queryFAQ('how to upgrade subscription');
```

---

### **`generateContextualQueries`**

**Generate relevant search queries from email content.**

```typescript
function generateContextualQueries(
  emailContent: string,
  includeCategories?: string[]
): Promise<RAGResult[]>
```

#### **Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `emailContent` | `string` | ✅ Yes | - | Email content to analyze |
| `includeCategories` | `string[]` | ❌ No | `['policy', 'knowledge', 'procedure']` | Categories to search |

#### **Example**

```typescript
const relevantInfo = await generateContextualQueries(
  "I can't access premium features after upgrading",
  ['procedure', 'faq']
);
```

---

## Thread Naming Functions

### **`generateThreadName`**

**Generate a comprehensive thread name with full analysis.**

```typescript
function generateThreadName(request: ThreadNamingRequest): Promise<ThreadNamingResponse>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | `ThreadNamingRequest` | ✅ Yes | Thread naming configuration |

#### **ThreadNamingRequest Interface**

```typescript
interface ThreadNamingRequest {
  thread: EmailThread;              // Thread to name
  maxLength?: number;               // Max name length (default: 50)
  includeCustomerName?: boolean;    // Include customer name (default: false)
  includeIssueType?: boolean;       // Include issue type (default: true)
  style?: 'concise' | 'descriptive' | 'technical'; // Naming style (default: 'concise')
}
```

#### **Returns**

`Promise<ThreadNamingResponse>` - Comprehensive naming analysis

#### **ThreadNamingResponse Interface**

```typescript
interface ThreadNamingResponse {
  name: string;                     // Generated thread name
  confidence: number;               // Confidence score (0-1)
  detectedIssueType?: string;       // Identified issue category
  keyTopics: string[];              // Main topics identified
  customerSentiment?: string;       // Customer emotional state
  urgencyLevel?: 'low' | 'medium' | 'high'; // Urgency assessment
  alternativeNames: string[];       // Alternative name suggestions
  reasoningSteps: string[];         // How the name was generated
}
```

#### **Example**

```typescript
const naming = await generateThreadName({
  thread: emailThread,
  maxLength: 60,
  includeCustomerName: true,
  style: 'descriptive'
});

console.log(`Name: ${naming.name}`);
console.log(`Confidence: ${naming.confidence}`);
console.log(`Issue Type: ${naming.detectedIssueType}`);
console.log(`Alternatives:`, naming.alternativeNames);
```

---

### **`generateQuickThreadName`**

**Generate a simple thread name quickly.**

```typescript
function generateQuickThreadName(thread: EmailThread): Promise<string>
```

#### **Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `thread` | `EmailThread` | ✅ Yes | Thread to name |

#### **Returns**

`Promise<string>` - Simple thread name

#### **Example**

```typescript
const name = await generateQuickThreadName(thread);
console.log(`Quick name: ${name}`);
```

---

## Utility Functions

### **`handleToolCall`**

**Execute a specific tool function.**

```typescript
function handleToolCall(toolName: string, args: any): Promise<string>
```

#### **Available Tools**

| Tool Name | Description | Arguments |
|-----------|-------------|-----------|
| `get_current_time` | Get current date/time | None |
| `query_company_knowledge` | Search knowledge base | `query`, `category?`, `maxResults?` |
| `query_company_policies` | Search policies | `policyQuery`, `policyType?` |
| `query_procedures` | Search procedures | `procedureQuery`, `issueType?` |
| `query_faq` | Search FAQ | `faqQuery` |
| `generate_thread_name` | Generate thread name | `thread`, `maxLength?`, `includeCustomerName?` |
| `generate_quick_thread_name` | Quick thread name | `thread` |
| `analyze_customer_sentiment` | Analyze sentiment | `emailContent` |
| `detect_escalation_signals` | Detect escalation needs | `emailContent`, `customerHistory?` |
| `generate_contextual_queries` | Generate search queries | `emailContent`, `includeCategories?` |

#### **Example**

```typescript
// Analyze sentiment
const sentiment = await handleToolCall('analyze_customer_sentiment', {
  emailContent: 'I am extremely frustrated!'
});

// Generate thread name
const threadName = await handleToolCall('generate_thread_name', {
  thread: emailThread,
  maxLength: 50
});
```

---

## Type Definitions

### **Core Types**

#### **`EmailThread`**

```typescript
interface EmailThread {
  id: string;                       // Unique thread identifier
  subject: string;                  // Email subject line
  messages: EmailMessage[];        // Array of messages in thread
  customerEmail: string;            // Customer's email address
  status: ThreadStatus;             // Current thread status
  priority: Priority;               // Thread priority level
  tags?: string[];                  // Thread tags
  assignedTo?: string;              // Assigned support agent
  createdAt: Date;                  // Thread creation timestamp
  updatedAt: Date;                  // Last update timestamp
  internalNotes?: string[];         // Internal support notes
  customFields?: Record<string, any>; // Custom metadata
}

type ThreadStatus = 'open' | 'pending' | 'resolved' | 'closed';
type Priority = 'low' | 'normal' | 'high' | 'urgent';
```

#### **`EmailMessage`**

```typescript
interface EmailMessage {
  id: string;                       // Unique message identifier
  threadId: string;                 // Parent thread ID
  from: string;                     // Sender email address
  to: string[];                     // Recipient email addresses
  cc?: string[];                    // CC recipients
  bcc?: string[];                   // BCC recipients
  subject: string;                  // Message subject
  body: string;                     // Message content
  timestamp: Date;                  // Message timestamp
  isFromCustomer: boolean;          // True if from customer
  attachments?: Attachment[];       // File attachments
  priority?: Priority;              // Message priority
}
```

#### **`Attachment`**

```typescript
interface Attachment {
  id: string;                       // Attachment identifier
  filename: string;                 // Original filename
  mimeType: string;                 // File MIME type
  size: number;                     // File size in bytes
  url?: string;                     // Download URL
  isInline?: boolean;               // Inline attachment flag
}
```

### **Context Types**

#### **`SupportContext`**

```typescript
interface SupportContext {
  customerHistory?: CustomerHistory;        // Customer's support history
  orderInformation?: OrderInfo[];          // Order history
  accountDetails?: AccountDetails;         // Account information
  escalationLevel?: EscalationLevel;       // Current escalation level
  urgencyReason?: string;                  // Reason for urgency
  internalNotes?: string[];                // Internal notes
  relatedThreads?: string[];               // Related thread IDs
}

type EscalationLevel = 'none' | 'tier1' | 'tier2' | 'manager';
```

#### **`CustomerHistory`**

```typescript
interface CustomerHistory {
  customerId: string;               // Customer identifier
  totalTickets: number;             // Total support tickets
  resolvedTickets: number;          // Successfully resolved tickets
  averageResolutionTime: number;    // Average resolution time (hours)
  satisfactionScore: number;        // Average satisfaction (1-5)
  lastContactDate?: Date;           // Last support contact
  preferredLanguage?: string;       // Customer's preferred language
  communicationPreference?: 'email' | 'phone' | 'chat';
}
```

#### **`OrderInfo`**

```typescript
interface OrderInfo {
  orderId: string;                  // Order identifier
  productName: string;              // Product/service name
  orderDate: Date;                  // Order date
  status: OrderStatus;              // Current order status
  amount: number;                   // Order amount
  currency: string;                 // Currency code
  shippingAddress?: Address;        // Shipping address
  billingAddress?: Address;         // Billing address
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
```

#### **`AccountDetails`**

```typescript
interface AccountDetails {
  customerId: string;               // Customer identifier
  email: string;                    // Account email
  name: string;                     // Customer name
  accountType: AccountType;         // Account tier/type
  subscriptionStatus: SubscriptionStatus; // Subscription status
  joinDate: Date;                   // Account creation date
  billingStatus: BillingStatus;     // Billing status
  lastLoginDate?: Date;             // Last login timestamp
}

type AccountType = 'free' | 'basic' | 'premium' | 'enterprise';
type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'pending';
type BillingStatus = 'current' | 'overdue' | 'suspended';
```

### **Response Types**

#### **`EnhancedAgentResponse`**

```typescript
interface EnhancedAgentResponse {
  draft: string;                    // Drafted email response
  reasoning: string;                // Agent's reasoning process
  threadName: string;               // Generated thread name
  confidence: number;               // Confidence score (0-1)
  suggestedPriority?: Priority;     // Recommended priority
  escalationRecommended?: boolean;  // Whether escalation is needed
  followUpRequired?: boolean;       // Whether follow-up is needed
  estimatedResolutionTime?: number; // Estimated hours to resolution
  ragSources?: RAGResult[];        // Knowledge sources used
  additionalActions?: string[];     // Recommended actions
  customerSentiment?: Sentiment;    // Customer emotional state
  tags?: string[];                 // Suggested thread tags
}

type Sentiment = 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry';
```

#### **`AgentResponse`** (Basic)

```typescript
interface AgentResponse {
  draft: string;                    // The drafted email response
  reasoning: string;                // The agent's reasoning process
}
```

### **RAG Types**

#### **`RAGResult`**

```typescript
interface RAGResult {
  id: string;                       // Unique result identifier
  title: string;                    // Document/section title
  content: string;                  // Relevant content
  category: RAGCategory;            // Content category
  relevanceScore: number;           // Relevance score (0-1)
  lastUpdated: Date;               // Last update timestamp
  source: string;                   // Source document/system
  url?: string;                     // Link to full document
  tags?: string[];                  // Content tags
  metadata?: Record<string, any>;   // Additional metadata
}
```

---

## Configuration Options

### **`AgentConfig`**

```typescript
interface AgentConfig {
  model?: string;                   // OpenAI model (default: 'gpt-4o')
  includeRAG?: boolean;            // Enable RAG system (default: true)
  generateThreadName?: boolean;     // Generate thread names (default: true)
  maxRAGResults?: number;          // Max RAG results (default: 5)
  enableSentimentAnalysis?: boolean; // Enable sentiment detection (default: true)
  confidenceThreshold?: number;    // Min confidence for responses (default: 0.7)
  escalationKeywords?: string[];   // Custom escalation triggers
  responseLanguage?: string;       // Response language (default: 'en')
  maxResponseLength?: number;      // Max response length (default: 1000)
  includeReasoning?: boolean;      // Include reasoning in response (default: true)
}
```

#### **Default Configuration**

```typescript
const defaultConfig: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  generateThreadName: true,
  maxRAGResults: 5,
  enableSentimentAnalysis: true,
  confidenceThreshold: 0.7,
  escalationKeywords: [
    'legal', 'lawyer', 'attorney', 'sue',
    'manager', 'supervisor', 'escalate',
    'complaint', 'unacceptable', 'terrible'
  ],
  responseLanguage: 'en',
  maxResponseLength: 1000,
  includeReasoning: true
};
```

#### **Configuration Examples**

**High Performance:**
```typescript
const highPerformanceConfig: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  maxRAGResults: 10,
  confidenceThreshold: 0.9,
  enableSentimentAnalysis: true
};
```

**Cost Optimized:**
```typescript
const costOptimizedConfig: AgentConfig = {
  model: 'gpt-4o-mini',
  includeRAG: false,
  generateThreadName: false,
  maxRAGResults: 3,
  enableSentimentAnalysis: false
};
```

**Escalation Focused:**
```typescript
const escalationConfig: AgentConfig = {
  enableSentimentAnalysis: true,
  escalationKeywords: [
    'angry', 'furious', 'outraged',
    'lawsuit', 'legal action',
    'cancel my account', 'terrible service'
  ],
  confidenceThreshold: 0.8
};
```

---

## Tool Functions

### **Individual Tool Documentation**

#### **`get_current_time`**

```typescript
// Get current date and time
const timeResult = await handleToolCall('get_current_time', {});
// Returns: "Current time: 2024-01-15 14:30:00 UTC"
```

#### **`analyze_customer_sentiment`**

```typescript
// Analyze customer emotional state
const sentimentResult = await handleToolCall('analyze_customer_sentiment', {
  emailContent: "I am extremely frustrated with this service!"
});
// Returns JSON with sentiment analysis
```

#### **`detect_escalation_signals`**

```typescript
// Detect if escalation is needed
const escalationResult = await handleToolCall('detect_escalation_signals', {
  emailContent: "I want to speak to your manager immediately!",
  customerHistory: JSON.stringify({
    totalTickets: 10,
    satisfactionScore: 2.1
  })
});
// Returns JSON with escalation analysis
```

---

## Error Handling

### **Error Types**

#### **`OpenAIError`**
```typescript
// OpenAI API related errors
try {
  const response = await assistSupportPersonEnhanced(thread);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid OpenAI API key');
  }
}
```

#### **`ValidationError`**
```typescript
// Input validation errors
try {
  const response = await assistSupportPersonEnhanced(null); // Invalid input
} catch (error) {
  console.error('Validation error:', error.message);
}
```

#### **`NetworkError`**
```typescript
// Network connectivity issues
try {
  const response = await queryCompanyKnowledge(query);
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('RAG system unreachable');
  }
}
```

### **Error Handling Best Practices**

```typescript
async function robustAgentCall(thread: EmailThread) {
  try {
    // Try enhanced agent first
    return await assistSupportPersonEnhanced(thread, undefined, {
      includeRAG: true,
      generateThreadName: true
    });
    
  } catch (enhancedError) {
    console.warn('Enhanced agent failed, trying fallback:', enhancedError.message);
    
    try {
      // Fallback to basic agent
      const basicResponse = await assistSupportPersonBasic(
        thread.messages[0]?.body || '',
        thread.internalNotes?.join(' ') || ''
      );
      
      // Add enhanced fields with default values
      return {
        ...basicResponse,
        threadName: `Support Request - ${new Date().toLocaleDateString()}`,
        confidence: 0.5,
        customerSentiment: 'neutral' as const,
        escalationRecommended: false
      };
      
    } catch (basicError) {
      console.error('All agents failed:', { enhancedError, basicError });
      
      // Ultimate fallback
      return {
        draft: "Thank you for contacting us. We're experiencing technical difficulties and will respond shortly.",
        reasoning: "System fallback due to technical issues",
        threadName: "System Issue - Please Review",
        confidence: 0.1,
        customerSentiment: 'neutral' as const,
        escalationRecommended: true
      };
    }
  }
}
```

---

## Examples

### **Complete Integration Example**

```typescript
import {
  assistSupportPersonEnhanced,
  EmailThread,
  SupportContext,
  AgentConfig,
  EnhancedAgentResponse
} from 'proresponse-agent';

async function handleSupportTicket(
  ticketData: any
): Promise<EnhancedAgentResponse> {
  
  // 1. Convert your data to EmailThread format
  const thread: EmailThread = {
    id: ticketData.id,
    subject: ticketData.subject,
    customerEmail: ticketData.customerEmail,
    status: 'open',
    priority: ticketData.priority || 'normal',
    createdAt: new Date(ticketData.createdAt),
    updatedAt: new Date(),
    messages: ticketData.messages.map(msg => ({
      id: msg.id,
      threadId: ticketData.id,
      from: msg.from,
      to: msg.to,
      subject: msg.subject,
      body: msg.body,
      timestamp: new Date(msg.timestamp),
      isFromCustomer: msg.from === ticketData.customerEmail
    }))
  };
  
  // 2. Build rich context
  const context: SupportContext = {
    customerHistory: {
      customerId: ticketData.customerId,
      totalTickets: ticketData.customerHistory?.totalTickets || 0,
      resolvedTickets: ticketData.customerHistory?.resolvedTickets || 0,
      averageResolutionTime: 24,
      satisfactionScore: ticketData.customerHistory?.satisfactionScore || 3.0
    },
    orderInformation: ticketData.orders || [],
    accountDetails: {
      customerId: ticketData.customerId,
      email: ticketData.customerEmail,
      name: ticketData.customerName,
      accountType: ticketData.accountType || 'basic',
      subscriptionStatus: ticketData.subscriptionStatus || 'active',
      joinDate: new Date(ticketData.joinDate),
      billingStatus: 'current'
    }
  };
  
  // 3. Configure agent
  const config: AgentConfig = {
    model: 'gpt-4o',
    includeRAG: true,
    generateThreadName: true,
    enableSentimentAnalysis: true,
    maxRAGResults: 5,
    confidenceThreshold: 0.8,
    escalationKeywords: [
      'legal', 'manager', 'complaint', 'unacceptable',
      'cancel', 'refund', 'terrible', 'awful'
    ]
  };
  
  // 4. Process with enhanced agent
  const response = await assistSupportPersonEnhanced(thread, context, config);
  
  // 5. Log comprehensive results
  console.log('🎯 Support Ticket Analysis:');
  console.log(`   Thread: ${response.threadName}`);
  console.log(`   Confidence: ${response.confidence}`);
  console.log(`   Sentiment: ${response.customerSentiment}`);
  console.log(`   Priority: ${response.suggestedPriority}`);
  console.log(`   Escalation: ${response.escalationRecommended ? 'YES' : 'NO'}`);
  console.log(`   Knowledge Sources: ${response.ragSources?.length || 0}`);
  console.log(`   Estimated Resolution: ${response.estimatedResolutionTime}h`);
  
  return response;
}

// Usage
const ticketResponse = await handleSupportTicket(incomingTicket);
```

### **Batch Processing Example**

```typescript
async function processBatchTickets(tickets: any[]): Promise<EnhancedAgentResponse[]> {
  const results = await Promise.all(
    tickets.map(async (ticket) => {
      try {
        return await handleSupportTicket(ticket);
      } catch (error) {
        console.error(`Failed to process ticket ${ticket.id}:`, error);
        return null;
      }
    })
  );
  
  // Filter out failed tickets and analyze batch
  const successfulResults = results.filter(Boolean) as EnhancedAgentResponse[];
  
  const analytics = {
    processed: successfulResults.length,
    failed: tickets.length - successfulResults.length,
    averageConfidence: successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length,
    escalationsNeeded: successfulResults.filter(r => r.escalationRecommended).length,
    sentimentBreakdown: analyzeSentiments(successfulResults)
  };
  
  console.log('📊 Batch Processing Results:', analytics);
  
  return successfulResults;
}

function analyzeSentiments(results: EnhancedAgentResponse[]) {
  return results.reduce((counts, result) => {
    const sentiment = result.customerSentiment || 'unknown';
    counts[sentiment] = (counts[sentiment] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}
```

---

**📞 API Support**

For additional API questions:
- Check inline code documentation (JSDoc comments)
- Review the comprehensive examples above
- Test with the provided example scripts
- Use TypeScript for full type safety and IntelliSense support

**🎯 Remember**: All functions include comprehensive logging with `[Agent]` prefixes for easy debugging and monitoring. 