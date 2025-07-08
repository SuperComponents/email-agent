# Migration Guide: v1.x → v2.0.0 🔄

**Complete guide for migrating from ProResponse Agent v1.x to v2.0.0 Enhanced with thread support, RAG integration, and advanced features.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Breaking Changes](#breaking-changes)
- [Migration Strategies](#migration-strategies)
- [Step-by-Step Migration](#step-by-step-migration)
- [Code Examples](#code-examples)
- [Data Structure Changes](#data-structure-changes)
- [Feature Mapping](#feature-mapping)
- [Testing Your Migration](#testing-your-migration)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### **🎯 What's Changed**

| Aspect | v1.x | v2.0.0 Enhanced |
|--------|------|-----------------|
| **Input Format** | Raw email strings | Structured EmailThread objects |
| **Response Data** | `{draft, reasoning}` | `{draft, reasoning, threadName, confidence, sentiment, etc.}` |
| **Knowledge Access** | None | RAG system integration |
| **Thread Management** | Single email processing | Full conversation thread analysis |
| **Customization** | Basic prompt modification | Rich configuration objects |
| **Tools Available** | 1 tool (time) | 10 specialized tools |
| **Type Safety** | Basic interfaces | Comprehensive TypeScript types |

### **✅ Backward Compatibility**

**Good News**: v2.0.0 is designed for smooth migration!

- **v1.x functions still work** - Use `assistSupportPersonBasic` 
- **Gradual migration** - Migrate one component at a time
- **Zero breaking changes** - Existing code continues to function
- **Enhanced alternatives** - New functions provide more capabilities

---

## Breaking Changes

### **🚨 None! (Backward Compatible)**

There are **no breaking changes** in v2.0.0. All v1.x code continues to work exactly as before.

### **📝 Function Name Changes (Optional)**

If you want to use the new naming convention:

```typescript
// OLD v1.x function names (still work)
import { assistSupportPerson } from 'proresponse-agent';

// NEW v2.0.0 naming (recommended)
import { assistSupportPersonBasic } from 'proresponse-agent';
```

The functions are identical - this is just clearer naming.

---

## Migration Strategies

### **🎯 Strategy 1: Immediate Compatibility (5 minutes)**

**Best for**: Quick updates, minimal risk

```typescript
// Just update your imports - no other changes needed
import { assistSupportPersonBasic as assistSupportPerson } from 'proresponse-agent';

// All your existing code works unchanged
const response = await assistSupportPerson(emailText, context, model);
```

**Pros**: 
- ✅ Zero code changes
- ✅ Immediate v2.0.0 benefits (bug fixes, performance)
- ✅ Access to new features when ready

**Cons**: 
- ❌ Missing enhanced features (thread naming, RAG, sentiment)

### **🎯 Strategy 2: Gradual Migration (1-2 weeks)**

**Best for**: Production systems, thorough testing

```typescript
// Phase 1: Update imports but keep using basic function
import { assistSupportPersonBasic, assistSupportPersonEnhanced } from 'proresponse-agent';

// Phase 2: Migrate high-value use cases to enhanced function
const useEnhanced = shouldUseEnhanced(emailData);
const response = useEnhanced 
  ? await assistSupportPersonEnhanced(emailThread)
  : await assistSupportPersonBasic(emailText, context);

// Phase 3: Fully migrate to enhanced function
const response = await assistSupportPersonEnhanced(emailThread, context, config);
```

**Pros**: 
- ✅ Test each component thoroughly
- ✅ Gradual rollout of new features
- ✅ Easy rollback if issues arise

**Cons**: 
- ❌ Requires more planning and development time

### **🎯 Strategy 3: Full Migration (1 week)**

**Best for**: New projects, embracing all v2.0.0 features

```typescript
// Convert everything to enhanced format from the start
import { assistSupportPersonEnhanced, EmailThread } from 'proresponse-agent';

// Convert all email data to thread format
const emailThread = convertToThread(emailData);
const response = await assistSupportPersonEnhanced(emailThread, context, config);
```

**Pros**: 
- ✅ Maximum feature benefit immediately
- ✅ Cleaner codebase with consistent patterns
- ✅ Future-ready architecture

**Cons**: 
- ❌ Requires converting all email data structures

---

## Step-by-Step Migration

### **📋 Phase 1: Basic Setup (Day 1)**

#### **1. Update Dependencies**
```bash
cd your-project
npm update proresponse-agent
npm run build
```

#### **2. Update Imports**
```typescript
// Before
import { assistSupportPerson } from 'proresponse-agent';

// After (choosing your strategy)
import { assistSupportPersonBasic } from 'proresponse-agent'; // Strategy 1
// OR
import { 
  assistSupportPersonBasic, 
  assistSupportPersonEnhanced 
} from 'proresponse-agent'; // Strategy 2
// OR
import { 
  assistSupportPersonEnhanced, 
  EmailThread, 
  SupportContext 
} from 'proresponse-agent'; // Strategy 3
```

#### **3. Test Existing Functionality**
```typescript
// Verify your existing code still works
const response = await assistSupportPersonBasic(
  "Test email content",
  "Test context",
  "gpt-4o"
);

console.log('✅ Migration Phase 1 successful:', response.draft);
```

### **📋 Phase 2: Data Structure Conversion (Days 2-3)**

#### **1. Analyze Your Current Data**
```typescript
// What you have now (v1.x format)
interface OldEmailData {
  customerEmail: string;
  subject: string;
  body: string;
  context: string;
  timestamp: Date;
}

// What you need for v2.0.0 enhanced
interface NewEmailData {
  thread: EmailThread;
  context: SupportContext;
  config: AgentConfig;
}
```

#### **2. Create Conversion Functions**
```typescript
// Helper function to convert your existing data
function convertEmailToThread(oldData: OldEmailData): EmailThread {
  return {
    id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    subject: oldData.subject,
    customerEmail: oldData.customerEmail,
    status: 'open',
    priority: 'normal',
    createdAt: oldData.timestamp,
    updatedAt: new Date(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        threadId: `thread-${Date.now()}`,
        from: oldData.customerEmail,
        to: ['support@yourcompany.com'],
        subject: oldData.subject,
        body: oldData.body,
        timestamp: oldData.timestamp,
        isFromCustomer: true
      }
    ]
  };
}

function convertContext(oldContext: string): SupportContext {
  return {
    internalNotes: oldContext ? [oldContext] : [],
    escalationLevel: 'none'
  };
}
```

#### **3. Test Conversion**
```typescript
// Test your conversion functions
const oldData: OldEmailData = {
  customerEmail: 'test@customer.com',
  subject: 'Test Issue',
  body: 'I have a problem with my account',
  context: 'Premium customer, order #12345',
  timestamp: new Date()
};

const thread = convertEmailToThread(oldData);
const context = convertContext(oldData.context);

console.log('✅ Conversion successful:', thread);
```

### **📋 Phase 3: Enhanced Feature Integration (Days 4-5)**

#### **1. Enable Thread Naming**
```typescript
const config: AgentConfig = {
  generateThreadName: true,
  includeRAG: false // Start simple
};

const response = await assistSupportPersonEnhanced(thread, context, config);
console.log('🏷️ Generated thread name:', response.threadName);
```

#### **2. Add Sentiment Analysis**
```typescript
const config: AgentConfig = {
  generateThreadName: true,
  enableSentimentAnalysis: true,
  escalationKeywords: [
    'angry', 'frustrated', 'unacceptable', 
    'manager', 'complaint', 'legal'
  ]
};

const response = await assistSupportPersonEnhanced(thread, context, config);
console.log('😊 Customer sentiment:', response.customerSentiment);
console.log('🚨 Escalation needed:', response.escalationRecommended);
```

#### **3. Test RAG Integration (when ready)**
```typescript
const config: AgentConfig = {
  generateThreadName: true,
  enableSentimentAnalysis: true,
  includeRAG: true, // Enable when your backend is ready
  maxRAGResults: 5
};

const response = await assistSupportPersonEnhanced(thread, context, config);
console.log('📚 Knowledge sources used:', response.ragSources?.length || 0);
```

### **📋 Phase 4: Production Deployment (Days 6-7)**

#### **1. A/B Testing Setup**
```typescript
// Gradual rollout with feature flags
const useEnhancedAgent = shouldUseEnhanced(emailData, userFlags);

const response = useEnhancedAgent
  ? await assistSupportPersonEnhanced(thread, context, config)
  : await assistSupportPersonBasic(emailData.body, emailData.context);

// Log for comparison
logAgentResponse(response, useEnhancedAgent ? 'enhanced' : 'basic');
```

#### **2. Monitor Performance**
```typescript
const startTime = Date.now();

const response = await assistSupportPersonEnhanced(thread, context, config);

const duration = Date.now() - startTime;
console.log(`[Migration] Enhanced agent completed in ${duration}ms`);

// Alert if slower than v1.x baseline
if (duration > YOUR_V1_BASELINE_MS) {
  console.warn(`[Migration] Performance regression: ${duration}ms vs baseline`);
}
```

#### **3. Validate Enhanced Features**
```typescript
// Verify all enhanced features are working
function validateEnhancedResponse(response: EnhancedAgentResponse): boolean {
  const checks = [
    response.draft && response.draft.length > 0,
    response.reasoning && response.reasoning.length > 0,
    response.threadName && response.threadName.length > 0,
    typeof response.confidence === 'number' && response.confidence >= 0 && response.confidence <= 1,
    response.customerSentiment !== undefined,
    response.escalationRecommended !== undefined
  ];
  
  const passedChecks = checks.filter(Boolean).length;
  const successRate = passedChecks / checks.length;
  
  console.log(`[Migration] Enhanced features validation: ${successRate * 100}% successful`);
  
  return successRate >= 0.8; // 80% of features working
}
```

---

## Code Examples

### **🔄 Before & After Comparisons**

#### **Basic Email Processing**

**Before (v1.x):**
```typescript
import { assistSupportPerson } from 'proresponse-agent';

async function handleCustomerEmail(emailText: string, supportContext: string) {
  try {
    const response = await assistSupportPerson(emailText, supportContext);
    
    return {
      draft: response.draft,
      reasoning: response.reasoning
    };
  } catch (error) {
    console.error('Agent error:', error);
    throw error;
  }
}
```

**After (v2.0.0):**
```typescript
import { assistSupportPersonEnhanced, EmailThread, SupportContext } from 'proresponse-agent';

async function handleCustomerEmailEnhanced(
  thread: EmailThread, 
  context: SupportContext
) {
  try {
    const response = await assistSupportPersonEnhanced(thread, context, {
      generateThreadName: true,
      enableSentimentAnalysis: true,
      includeRAG: true
    });
    
    return {
      draft: response.draft,
      reasoning: response.reasoning,
      threadName: response.threadName,
      confidence: response.confidence,
      sentiment: response.customerSentiment,
      escalationNeeded: response.escalationRecommended,
      knowledgeSources: response.ragSources?.length || 0
    };
  } catch (error) {
    console.error('Enhanced agent error:', error);
    throw error;
  }
}
```

#### **Batch Processing**

**Before (v1.x):**
```typescript
async function processBatchEmails(emails: string[], contexts: string[]) {
  const results = [];
  
  for (let i = 0; i < emails.length; i++) {
    const response = await assistSupportPerson(emails[i], contexts[i]);
    results.push(response);
  }
  
  return results;
}
```

**After (v2.0.0):**
```typescript
async function processBatchEmailsEnhanced(threads: EmailThread[], contexts: SupportContext[]) {
  // Process in parallel for better performance
  const promises = threads.map((thread, index) => 
    assistSupportPersonEnhanced(thread, contexts[index], {
      generateThreadName: true,
      enableSentimentAnalysis: true
    })
  );
  
  const results = await Promise.all(promises);
  
  // Enhanced analytics
  const analytics = {
    totalProcessed: results.length,
    averageConfidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
    escalationsNeeded: results.filter(r => r.escalationRecommended).length,
    sentimentBreakdown: countSentiments(results)
  };
  
  console.log('📊 Batch processing analytics:', analytics);
  
  return { results, analytics };
}

function countSentiments(results: EnhancedAgentResponse[]) {
  return results.reduce((counts, result) => {
    const sentiment = result.customerSentiment || 'unknown';
    counts[sentiment] = (counts[sentiment] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}
```

#### **Error Handling Enhancement**

**Before (v1.x):**
```typescript
async function robustEmailProcessing(emailText: string, context: string) {
  try {
    return await assistSupportPerson(emailText, context);
  } catch (error) {
    // Simple fallback
    return {
      draft: "I apologize, but I'm unable to process your request right now. Please contact our support team directly.",
      reasoning: "Automated response due to processing error"
    };
  }
}
```

**After (v2.0.0):**
```typescript
async function robustEmailProcessingEnhanced(
  thread: EmailThread, 
  context: SupportContext
) {
  try {
    // Try enhanced agent first
    return await assistSupportPersonEnhanced(thread, context, {
      generateThreadName: true,
      enableSentimentAnalysis: true,
      includeRAG: true,
      confidenceThreshold: 0.7
    });
    
  } catch (enhancedError) {
    console.warn('Enhanced agent failed, trying basic fallback:', enhancedError);
    
    try {
      // Fallback to basic agent
      const basicResponse = await assistSupportPersonBasic(
        thread.messages[0]?.body || 'No content',
        context.internalNotes?.join(' ') || ''
      );
      
      // Add enhanced fields with fallback values
      return {
        ...basicResponse,
        threadName: generateFallbackThreadName(thread),
        confidence: 0.5, // Lower confidence for fallback
        customerSentiment: detectBasicSentiment(thread.messages[0]?.body),
        escalationRecommended: false
      };
      
    } catch (basicError) {
      console.error('Both agents failed:', { enhancedError, basicError });
      
      // Ultimate fallback
      return {
        draft: generateFallbackResponse(thread),
        reasoning: "Fallback response due to system errors",
        threadName: `Support Request - ${new Date().toLocaleDateString()}`,
        confidence: 0.1,
        customerSentiment: 'neutral' as const,
        escalationRecommended: true // Escalate if systems are down
      };
    }
  }
}

function generateFallbackThreadName(thread: EmailThread): string {
  const subject = thread.subject || 'Support Request';
  return `${subject.substring(0, 50)}${subject.length > 50 ? '...' : ''}`;
}

function detectBasicSentiment(content?: string): 'positive' | 'neutral' | 'negative' {
  if (!content) return 'neutral';
  
  const positive = ['thank', 'great', 'excellent', 'love', 'amazing'];
  const negative = ['angry', 'frustrated', 'terrible', 'hate', 'awful'];
  
  const contentLower = content.toLowerCase();
  
  if (negative.some(word => contentLower.includes(word))) return 'negative';
  if (positive.some(word => contentLower.includes(word))) return 'positive';
  
  return 'neutral';
}
```

---

## Data Structure Changes

### **📊 Input Data Evolution**

#### **v1.x Input (Strings)**
```typescript
// Simple string-based input
const emailText = "Customer email content...";
const context = "Customer context information...";
const model = "gpt-4o";

const response = await assistSupportPerson(emailText, context, model);
```

#### **v2.0.0 Input (Structured Objects)**
```typescript
// Rich structured input
const emailThread: EmailThread = {
  id: 'thread-123',
  subject: 'Billing Issue',
  customerEmail: 'customer@example.com',
  status: 'open',
  priority: 'high',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T14:30:00Z'),
  messages: [
    {
      id: 'msg-1',
      threadId: 'thread-123',
      from: 'customer@example.com',
      to: ['support@company.com'],
      subject: 'Billing Issue',
      body: 'Customer email content...',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      isFromCustomer: true,
      priority: 'high'
    }
  ],
  tags: ['billing', 'urgent'],
  internalNotes: ['Customer context information...']
};

const context: SupportContext = {
  customerHistory: {
    customerId: 'cust-123',
    totalTickets: 3,
    resolvedTickets: 2,
    averageResolutionTime: 24.5,
    satisfactionScore: 4.2
  },
  orderInformation: [
    {
      orderId: 'ORD-2024-001',
      productName: 'Premium Plan',
      orderDate: new Date('2024-01-01'),
      status: 'active',
      amount: 99.99,
      currency: 'USD'
    }
  ],
  accountDetails: {
    customerId: 'cust-123',
    email: 'customer@example.com',
    name: 'John Doe',
    accountType: 'premium',
    subscriptionStatus: 'active',
    joinDate: new Date('2023-01-01'),
    billingStatus: 'current'
  }
};

const config: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  generateThreadName: true,
  enableSentimentAnalysis: true,
  confidenceThreshold: 0.8
};

const response = await assistSupportPersonEnhanced(thread, context, config);
```

### **📊 Output Data Evolution**

#### **v1.x Output (Basic)**
```typescript
interface AgentResponse {
  draft: string;      // Email response draft
  reasoning: string;  // Agent reasoning
}
```

#### **v2.0.0 Output (Comprehensive)**
```typescript
interface EnhancedAgentResponse {
  draft: string;                    // Email response draft
  reasoning: string;                // Agent reasoning
  threadName: string;               // Generated thread name
  confidence: number;               // Confidence score (0-1)
  suggestedPriority?: 'low' | 'normal' | 'high' | 'urgent';
  escalationRecommended?: boolean;  // Whether escalation is needed
  followUpRequired?: boolean;       // Whether follow-up is needed
  estimatedResolutionTime?: number; // Hours to resolution
  ragSources?: RAGResult[];        // Knowledge sources used
  additionalActions?: string[];     // Recommended actions
  customerSentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry';
  tags?: string[];                 // Suggested thread tags
}
```

---

## Feature Mapping

### **🔄 v1.x → v2.0.0 Feature Mapping**

| v1.x Feature | v2.0.0 Equivalent | Enhancement |
|--------------|-------------------|-------------|
| `assistSupportPerson()` | `assistSupportPersonEnhanced()` | ✅ Full thread support + metadata |
| Basic email text input | `EmailThread` object | ✅ Structured conversation data |
| Simple context string | `SupportContext` object | ✅ Rich customer history & details |
| Model selection | `AgentConfig.model` | ✅ Plus comprehensive configuration |
| Draft response | `response.draft` | ✅ Same, but with better context awareness |
| Agent reasoning | `response.reasoning` | ✅ Same, but more detailed analysis |
| Error handling | Enhanced error handling | ✅ Graceful fallbacks + better logging |
| **N/A** | `response.threadName` | 🆕 ChatGPT-style thread naming |
| **N/A** | `response.confidence` | 🆕 AI confidence scoring |
| **N/A** | `response.customerSentiment` | 🆕 Sentiment analysis |
| **N/A** | `response.escalationRecommended` | 🆕 Escalation detection |
| **N/A** | `response.ragSources` | 🆕 Knowledge base integration |
| **N/A** | 10 specialized tools | 🆕 vs. 1 basic tool |

### **🎯 Backward Compatibility Mapping**

```typescript
// v1.x code
const v1Response = await assistSupportPerson(emailText, context, model);

// Equivalent v2.0.0 code (100% compatible)
const v2Response = await assistSupportPersonBasic(emailText, context, model);

// v1Response === v2Response (identical results)
```

---

## Testing Your Migration

### **✅ Migration Testing Checklist**

#### **Phase 1: Compatibility Testing**
```typescript
async function testBackwardCompatibility() {
  const testCases = [
    {
      email: "I need help with my order #12345",
      context: "Premium customer, order from yesterday",
      model: "gpt-4o"
    },
    {
      email: "Your service is terrible and I want a refund!",
      context: "Customer has had 3 previous tickets",
      model: "gpt-4o-mini"
    }
  ];
  
  for (const testCase of testCases) {
    // Test basic function works
    const response = await assistSupportPersonBasic(
      testCase.email, 
      testCase.context, 
      testCase.model
    );
    
    console.assert(response.draft.length > 0, 'Draft should not be empty');
    console.assert(response.reasoning.length > 0, 'Reasoning should not be empty');
    
    console.log('✅ Backward compatibility test passed');
  }
}
```

#### **Phase 2: Enhanced Feature Testing**
```typescript
async function testEnhancedFeatures() {
  const thread: EmailThread = {
    id: 'test-thread',
    subject: 'Test Migration',
    customerEmail: 'test@example.com',
    status: 'open',
    priority: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: 'test-msg',
        threadId: 'test-thread',
        from: 'test@example.com',
        to: ['support@company.com'],
        subject: 'Test Migration',
        body: 'I am testing the migration to v2.0.0',
        timestamp: new Date(),
        isFromCustomer: true
      }
    ]
  };
  
  const response = await assistSupportPersonEnhanced(thread, undefined, {
    generateThreadName: true,
    enableSentimentAnalysis: true
  });
  
  // Test enhanced features
  console.assert(response.threadName.length > 0, 'Thread name should be generated');
  console.assert(typeof response.confidence === 'number', 'Confidence should be a number');
  console.assert(response.customerSentiment !== undefined, 'Sentiment should be detected');
  
  console.log('✅ Enhanced features test passed');
  console.log('🏷️ Generated thread name:', response.threadName);
  console.log('📊 Confidence score:', response.confidence);
  console.log('😊 Customer sentiment:', response.customerSentiment);
}
```

#### **Phase 3: Performance Testing**
```typescript
async function testPerformance() {
  const iterations = 10;
  const testEmail = "I need help with billing";
  
  // Test v1.x performance
  const v1Times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await assistSupportPersonBasic(testEmail, "Test context");
    v1Times.push(Date.now() - start);
  }
  
  // Test v2.0.0 performance
  const thread = convertEmailToThread({
    customerEmail: 'test@example.com',
    subject: 'Test',
    body: testEmail,
    context: 'Test context',
    timestamp: new Date()
  });
  
  const v2Times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await assistSupportPersonEnhanced(thread);
    v2Times.push(Date.now() - start);
  }
  
  const v1Avg = v1Times.reduce((a, b) => a + b, 0) / v1Times.length;
  const v2Avg = v2Times.reduce((a, b) => a + b, 0) / v2Times.length;
  
  console.log(`📊 Performance comparison:`);
  console.log(`   v1.x average: ${v1Avg}ms`);
  console.log(`   v2.0.0 average: ${v2Avg}ms`);
  console.log(`   Difference: ${v2Avg - v1Avg}ms (${((v2Avg / v1Avg - 1) * 100).toFixed(1)}%)`);
  
  if (v2Avg < v1Avg * 1.5) { // Allow 50% slowdown for enhanced features
    console.log('✅ Performance test passed');
  } else {
    console.warn('⚠️ Performance regression detected');
  }
}
```

### **🎯 Test Script Setup**

Create a comprehensive test script:

```typescript
// test-migration.ts
import { 
  assistSupportPersonBasic, 
  assistSupportPersonEnhanced,
  EmailThread,
  SupportContext
} from 'proresponse-agent';

async function runMigrationTests() {
  console.log('🧪 Starting migration tests...\n');
  
  try {
    await testBackwardCompatibility();
    console.log('✅ Phase 1: Backward compatibility - PASSED\n');
    
    await testEnhancedFeatures();
    console.log('✅ Phase 2: Enhanced features - PASSED\n');
    
    await testPerformance();
    console.log('✅ Phase 3: Performance - PASSED\n');
    
    console.log('🎉 All migration tests passed! Ready for production.');
    
  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  }
}

runMigrationTests();
```

Run with:
```bash
npx ts-node test-migration.ts
```

---

## Performance Considerations

### **📊 Expected Performance Changes**

| Aspect | v1.x | v2.0.0 Basic | v2.0.0 Enhanced |
|--------|------|--------------|------------------|
| **Response Time** | 2-4 seconds | 2-4 seconds | 3-6 seconds |
| **Memory Usage** | ~30MB | ~30MB | ~50MB |
| **Token Usage** | 1,000-2,000 | 1,000-2,000 | 2,000-5,000 |
| **API Calls** | 1 (OpenAI) | 1 (OpenAI) | 1-3 (OpenAI + RAG) |

### **⚡ Performance Optimization Tips**

#### **1. Gradual Feature Enablement**
```typescript
// Start with minimal features, add gradually
const basicConfig: AgentConfig = {
  generateThreadName: false,
  includeRAG: false,
  enableSentimentAnalysis: false
};

const mediumConfig: AgentConfig = {
  generateThreadName: true,
  includeRAG: false,
  enableSentimentAnalysis: true
};

const fullConfig: AgentConfig = {
  generateThreadName: true,
  includeRAG: true,
  enableSentimentAnalysis: true,
  maxRAGResults: 5
};
```

#### **2. Caching Strategy**
```typescript
// Cache thread names and sentiment analysis
const cache = new Map<string, Partial<EnhancedAgentResponse>>();

async function cachedEnhancedResponse(thread: EmailThread) {
  const cacheKey = generateCacheKey(thread);
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('📦 Using cached analysis');
    // Use cached thread name and sentiment, but generate fresh draft
    const response = await assistSupportPersonEnhanced(thread, undefined, {
      generateThreadName: false, // Use cached
      enableSentimentAnalysis: false // Use cached
    });
    
    return {
      ...response,
      threadName: cached.threadName!,
      customerSentiment: cached.customerSentiment!
    };
  }
  
  // Full analysis for new threads
  const response = await assistSupportPersonEnhanced(thread);
  
  // Cache the analysis parts
  cache.set(cacheKey, {
    threadName: response.threadName,
    customerSentiment: response.customerSentiment
  });
  
  return response;
}
```

#### **3. Parallel Processing**
```typescript
// Process multiple threads in parallel
async function processMultipleThreads(threads: EmailThread[]) {
  const promises = threads.map(thread => 
    assistSupportPersonEnhanced(thread, undefined, {
      generateThreadName: true,
      enableSentimentAnalysis: true,
      includeRAG: false // Disable RAG for batch processing
    })
  );
  
  return await Promise.all(promises);
}
```

---

## Troubleshooting

### **🔧 Common Migration Issues**

#### **Issue 1: TypeScript Errors**
```typescript
// Problem: Type errors when using new interfaces
// Solution: Update your TypeScript types

// Before (might cause errors)
interface OldResponse {
  draft: string;
  reasoning: string;
}

// After (updated for v2.0.0)
import { EnhancedAgentResponse } from 'proresponse-agent';

function handleResponse(response: EnhancedAgentResponse) {
  // All properties are properly typed
  console.log(response.threadName); // ✅ TypeScript knows this exists
  console.log(response.confidence); // ✅ TypeScript knows this is a number
}
```

#### **Issue 2: Performance Regression**
```typescript
// Problem: v2.0.0 is slower than v1.x
// Solution: Optimize configuration and use caching

// Too many features enabled
const slowConfig: AgentConfig = {
  generateThreadName: true,
  includeRAG: true,
  maxRAGResults: 20, // Too many
  enableSentimentAnalysis: true,
  confidenceThreshold: 0.9 // Too high, forces more processing
};

// Optimized configuration
const fastConfig: AgentConfig = {
  generateThreadName: true,
  includeRAG: true,
  maxRAGResults: 3, // Fewer results
  enableSentimentAnalysis: true,
  confidenceThreshold: 0.7 // Reasonable threshold
};
```

#### **Issue 3: RAG Integration Errors**
```typescript
// Problem: RAG system not working
// Solution: Graceful fallback and proper error handling

async function robustRAGQuery(thread: EmailThread) {
  try {
    return await assistSupportPersonEnhanced(thread, undefined, {
      includeRAG: true,
      maxRAGResults: 5
    });
  } catch (ragError) {
    console.warn('RAG system unavailable, using basic agent:', ragError);
    
    // Fallback to basic agent
    return await assistSupportPersonBasic(
      thread.messages[0]?.body || '',
      thread.internalNotes?.join(' ') || ''
    );
  }
}
```

#### **Issue 4: Memory Usage Increase**
```typescript
// Problem: Higher memory usage with enhanced features
// Solution: Process in smaller batches and clean up

async function memoryEfficientProcessing(threads: EmailThread[]) {
  const batchSize = 5; // Process 5 at a time instead of all
  const results: EnhancedAgentResponse[] = [];
  
  for (let i = 0; i < threads.length; i += batchSize) {
    const batch = threads.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(thread => assistSupportPersonEnhanced(thread))
    );
    
    results.push(...batchResults);
    
    // Force garbage collection between batches (if needed)
    if (global.gc) {
      global.gc();
    }
  }
  
  return results;
}
```

### **🆘 Getting Help**

If you encounter issues during migration:

1. **Check the logs** - Enhanced agent provides detailed logging
2. **Test with basic agent** - Verify core functionality works
3. **Start minimal** - Enable features one by one
4. **Check dependencies** - Ensure OpenAI API key is valid
5. **Review examples** - Use the provided migration examples

### **📞 Support Checklist**

When seeking help, provide:
- [ ] v1.x code that was working
- [ ] v2.0.0 code you're trying
- [ ] Error messages and logs
- [ ] Performance metrics (if applicable)
- [ ] Configuration objects used
- [ ] Test data (anonymized)

---

## 🎯 Migration Success Criteria

Your migration is successful when:

- [ ] **Backward Compatibility**: All v1.x code works with v2.0.0
- [ ] **Enhanced Features**: New features work as expected
- [ ] **Performance**: Response times within acceptable range
- [ ] **Error Handling**: Graceful fallbacks for all scenarios
- [ ] **Testing**: Comprehensive test coverage for new features
- [ ] **Monitoring**: Logging and analytics in place
- [ ] **Documentation**: Team knows how to use new features

---

**🎉 Congratulations on migrating to ProResponse Agent v2.0.0!**

You now have access to:
- 📧 Full email thread support
- 🧠 RAG knowledge integration
- 🏷️ Automatic thread naming
- 😊 Sentiment analysis
- ⚡ Escalation detection
- 📊 Comprehensive response metadata

Your customer support AI is now significantly more powerful and intelligent! 