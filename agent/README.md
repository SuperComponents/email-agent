# ProResponse Agent v2.0.0 🚀

**Enhanced TypeScript library providing an AI support agent assistant with email thread support, RAG integration, and automatic thread naming for support teams.**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/proresponse-agent)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🌟 What's New in v2.0.0

### **🎯 Major Enhancements:**
- **📧 Email Thread Support** - Analyze complete conversation threads instead of single emails
- **🧠 RAG Integration** - Access company knowledge base, policies, and procedures
- **🏷️ Automatic Thread Naming** - Generate ChatGPT-style conversation titles
- **😊 Sentiment Analysis** - Detect customer emotional state and satisfaction
- **⚡ Escalation Detection** - Identify when issues need manager attention
- **🎛️ Enhanced Configuration** - Customizable agent behavior and capabilities
- **📊 Rich Response Metadata** - Confidence scores, priorities, estimated resolution times
- **🔧 Multiple Specialized Tools** - 10 tools vs. 1 in v1.x

### **🔄 Migration from v1.x:**
- **Backward Compatible**: Use `assistSupportPersonBasic` for original behavior
- **Enhanced API**: New `assistSupportPersonEnhanced` with thread support
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🎯 Usage Examples](#-usage-examples)
- [📚 API Reference](#-api-reference)
- [🧠 RAG Integration](#-rag-integration)
- [🏷️ Thread Naming](#️-thread-naming)
- [⚙️ Configuration](#️-configuration)
- [🔧 Integration Guide](#-integration-guide)
- [🔄 Migration from v1.x](#-migration-from-v1x)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Development](#️-development)
- [❓ FAQ](#-faq)

---

## 🚀 Quick Start

### **Basic Enhanced Usage:**

```typescript
import { assistSupportPersonEnhanced, EmailThread } from 'proresponse-agent';

// Create an email thread (normally from your backend)
const emailThread: EmailThread = {
  id: 'thread-123',
  subject: 'Premium subscription not working',
  customerEmail: 'customer@example.com',
  status: 'open',
  priority: 'normal',
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [
    {
      id: 'msg-1',
      threadId: 'thread-123',
      from: 'customer@example.com',
      to: ['support@yourcompany.com'],
      subject: 'Premium subscription not working',
      body: 'Hi, I upgraded to premium but can\'t access premium features...',
      timestamp: new Date(),
      isFromCustomer: true
    }
    // ... more messages
  ]
};

// Analyze with enhanced agent
const response = await assistSupportPersonEnhanced(emailThread);

console.log('🏷️ Thread Name:', response.threadName);
console.log('📝 Draft Response:', response.draft);
console.log('📊 Confidence:', response.confidence);
console.log('⚡ Priority:', response.suggestedPriority);
console.log('🚨 Escalation Needed:', response.escalationRecommended);
console.log('😊 Customer Sentiment:', response.customerSentiment);
console.log('📚 Knowledge Sources:', response.ragSources?.length);
```

---

## ✨ Features

### **🎯 Core Capabilities**

| Feature | v1.x | v2.x Enhanced |
|---------|------|---------------|
| **Input Format** | Raw email text | Structured email threads |
| **Knowledge Access** | ❌ None | ✅ RAG system integration |
| **Thread Naming** | ❌ None | ✅ ChatGPT-style naming |
| **Sentiment Analysis** | ❌ Basic | ✅ Advanced detection |
| **Escalation Detection** | ❌ None | ✅ AI-powered analysis |
| **Customer Context** | ❌ Basic string | ✅ Rich structured data |
| **Response Metadata** | ❌ Basic | ✅ Comprehensive analytics |
| **Available Tools** | 1 tool | 10 specialized tools |
| **Configuration** | ❌ Limited | ✅ Highly configurable |

### **📧 Email Thread Support**
- **Complete Conversation Analysis** - Process entire email threads, not just single messages
- **Message Metadata** - Timestamps, priorities, attachments, sender identification
- **Thread Status Tracking** - Open, pending, resolved, closed status management
- **Conversation Flow Understanding** - Chronological analysis of customer-support interactions

### **🧠 RAG (Retrieval-Augmented Generation) Integration**
- **Company Knowledge Base** - Access policies, procedures, and documentation
- **Contextual Search** - Automatic relevance-based knowledge retrieval
- **Policy Enforcement** - Ensure responses align with company guidelines
- **Procedure Integration** - Reference step-by-step troubleshooting guides
- **FAQ Integration** - Quick access to frequently asked questions

### **🏷️ Automatic Thread Naming**
- **ChatGPT-Style Titles** - Generate descriptive, concise thread names
- **Issue Type Detection** - Identify billing, technical, shipping, etc.
- **Customer Context** - Include or exclude customer names in titles
- **Confidence Scoring** - Rate the quality of generated names
- **Alternative Suggestions** - Multiple naming options for selection

### **😊 Advanced Sentiment Analysis**
- **Emotional State Detection** - Positive, neutral, negative, frustrated, angry
- **Escalation Triggers** - Identify legal threats, complaints, cancellation requests
- **Satisfaction Prediction** - Estimate customer satisfaction levels
- **Response Tone Adaptation** - Adjust response style based on sentiment

### **⚡ Smart Escalation Detection**
- **Keyword Analysis** - Detect escalation signals (legal, manager, complaint)
- **Pattern Recognition** - Identify frustration patterns and urgency indicators
- **Customer History** - Consider past ticket volume and satisfaction
- **Risk Assessment** - Evaluate churn risk and escalation necessity

---

## 📦 Installation

### **Prerequisites**
- **Node.js** 18+ (LTS recommended)
- **TypeScript** 5.0+ (for development)
- **OpenAI API Key** (required)

### **Install Dependencies**

```bash
npm install
```

### **Development Dependencies**

```bash
npm install --save-dev typescript @types/node
```

### **Environment Setup**

Create a `.env` file in your project root:

```bash
# Required
OPENAI_API_KEY=your-openai-api-key-here

# Optional (for future backend integration)
RAG_SYSTEM_URL=your-rag-backend-url
LOG_LEVEL=info
```

### **Build the Project**

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

---

## 🎯 Usage Examples

### **🔰 Basic Thread Analysis**

```typescript
import { assistSupportPersonEnhanced, EmailThread } from 'proresponse-agent';

const thread: EmailThread = {
  id: 'thread-001',
  subject: 'Billing Issue - Urgent',
  customerEmail: 'john@customer.com',
  status: 'open',
  priority: 'high',
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T14:30:00Z'),
  messages: [/* array of email messages */]
};

const response = await assistSupportPersonEnhanced(thread);
```

### **🎛️ Advanced Configuration**

```typescript
import { 
  assistSupportPersonEnhanced, 
  EmailThread, 
  SupportContext, 
  AgentConfig 
} from 'proresponse-agent';

// Rich customer context
const context: SupportContext = {
  customerHistory: {
    customerId: 'cust-123',
    totalTickets: 5,
    resolvedTickets: 4,
    averageResolutionTime: 12.5,
    satisfactionScore: 4.2
  },
  orderInformation: [
    {
      orderId: 'ORD-2024-001',
      productName: 'Premium Plan',
      orderDate: new Date('2024-01-08'),
      status: 'delivered',
      amount: 99.99,
      currency: 'USD'
    }
  ],
  accountDetails: {
    customerId: 'cust-123',
    email: 'john@customer.com',
    name: 'John Doe',
    accountType: 'premium',
    subscriptionStatus: 'active',
    joinDate: new Date('2023-01-15'),
    billingStatus: 'current'
  }
};

// Agent configuration
const config: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  generateThreadName: true,
  maxRAGResults: 5,
  enableSentimentAnalysis: true,
  confidenceThreshold: 0.8,
  escalationKeywords: ['legal', 'lawyer', 'manager', 'complaint']
};

const response = await assistSupportPersonEnhanced(thread, context, config);
```

### **📚 RAG System Usage**

```typescript
import { queryCompanyPolicies, queryProcedures } from 'proresponse-agent';

// Query specific policies
const policyResults = await queryCompanyPolicies(
  'refund policy for premium subscriptions', 
  'refund'
);

// Query troubleshooting procedures
const procedureResults = await queryProcedures(
  'premium features not working',
  'technical'
);

console.log('Policy Results:', policyResults);
console.log('Procedure Results:', procedureResults);
```

### **🏷️ Thread Naming**

```typescript
import { generateThreadName, ThreadNamingRequest } from 'proresponse-agent';

const namingRequest: ThreadNamingRequest = {
  thread: emailThread,
  maxLength: 60,
  includeCustomerName: false,
  includeIssueType: true
};

const naming = await generateThreadName(namingRequest);

console.log('Generated Name:', naming.name);
console.log('Confidence:', naming.confidence);
console.log('Issue Type:', naming.detectedIssueType);
console.log('Key Topics:', naming.keyTopics);
console.log('Alternatives:', naming.alternativeNames);
```

### **🔧 Individual Tool Usage**

```typescript
import { handleToolCall } from 'proresponse-agent';

// Analyze sentiment
const sentimentResult = await handleToolCall('analyze_customer_sentiment', {
  emailContent: 'I am extremely frustrated with this service!'
});

// Detect escalation signals
const escalationResult = await handleToolCall('detect_escalation_signals', {
  emailContent: 'I want to speak to your manager immediately!',
  customerHistory: JSON.stringify({ totalTickets: 10, satisfactionScore: 2 })
});
```

---

## 📚 API Reference

### **🎯 Core Functions**

#### **`assistSupportPersonEnhanced(thread, context?, config?)`**

**Main enhanced agent function with full capabilities.**

```typescript
function assistSupportPersonEnhanced(
  thread: EmailThread,
  context?: SupportContext,
  config?: AgentConfig
): Promise<EnhancedAgentResponse>
```

**Parameters:**
- `thread` (EmailThread): Complete email thread with messages
- `context` (SupportContext, optional): Customer history and support context
- `config` (AgentConfig, optional): Agent configuration options

**Returns:** `Promise<EnhancedAgentResponse>`

```typescript
interface EnhancedAgentResponse {
  draft: string;                      // Drafted email response
  reasoning: string;                  // Agent's reasoning process
  threadName: string;                 // Generated thread name
  confidence: number;                 // Confidence score (0-1)
  suggestedPriority?: 'low' | 'normal' | 'high' | 'urgent';
  escalationRecommended?: boolean;    // Whether escalation is needed
  followUpRequired?: boolean;         // Whether follow-up is needed
  estimatedResolutionTime?: number;   // Hours to resolution
  ragSources?: RAGResult[];          // Knowledge sources used
  additionalActions?: string[];       // Recommended actions
  customerSentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry';
  tags?: string[];                   // Suggested thread tags
}
```

#### **`assistSupportPersonBasic(emailText, context?, model?)`**

**Original v1.x function for backward compatibility.**

```typescript
function assistSupportPersonBasic(
  customerEmail: string,
  context?: string,
  preferredModel?: string
): Promise<AgentResponse>
```

### **🧠 RAG Functions**

#### **`queryCompanyKnowledge(query)`**
```typescript
function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]>
```

#### **`queryCompanyPolicies(policyQuery, policyType?)`**
```typescript
function queryCompanyPolicies(
  policyQuery: string, 
  policyType?: 'refund' | 'privacy' | 'terms' | 'shipping' | 'support'
): Promise<RAGResult[]>
```

#### **`queryProcedures(procedureQuery, issueType?)`**
```typescript
function queryProcedures(
  procedureQuery: string,
  issueType?: 'technical' | 'billing' | 'shipping' | 'account' | 'general'
): Promise<RAGResult[]>
```

### **🏷️ Thread Naming Functions**

#### **`generateThreadName(request)`**
```typescript
function generateThreadName(request: ThreadNamingRequest): Promise<ThreadNamingResponse>
```

#### **`generateQuickThreadName(thread)`**
```typescript
function generateQuickThreadName(thread: EmailThread): Promise<string>
```

### **📊 Data Types**

#### **`EmailThread`**
```typescript
interface EmailThread {
  id: string;
  subject: string;
  messages: EmailMessage[];
  customerEmail: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  internalNotes?: string[];
  customFields?: Record<string, any>;
}
```

#### **`EmailMessage`**
```typescript
interface EmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: Date;
  isFromCustomer: boolean;
  attachments?: Attachment[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}
```

#### **`SupportContext`**
```typescript
interface SupportContext {
  customerHistory?: CustomerHistory;
  orderInformation?: OrderInfo[];
  accountDetails?: AccountDetails;
  escalationLevel?: 'none' | 'tier1' | 'tier2' | 'manager';
  urgencyReason?: string;
  internalNotes?: string[];
  relatedThreads?: string[];
}
```

---

## 🧠 RAG Integration

### **📚 Overview**

The RAG (Retrieval-Augmented Generation) system allows the agent to access your company's knowledge base, policies, and procedures to provide accurate, consistent responses.

### **🔧 Current Implementation**

**Status: Skeleton Functions Ready for Backend Integration**

All RAG functions are currently implemented as skeleton functions that:
- ✅ Return mock data for development and testing
- ✅ Have the correct interfaces and error handling
- ✅ Include comprehensive logging
- ✅ Are ready for backend team integration

### **🚀 Integration Steps**

1. **Replace Skeleton Functions** in `src/ragSystem.ts`
2. **Connect to Vector Database** (Pinecone, Weaviate, ChromaDB, etc.)
3. **Implement Semantic Search** using embeddings
4. **Index Company Content** (policies, procedures, FAQs)
5. **Configure Real-time Updates** for knowledge base

### **📋 Backend Requirements**

#### **Vector Database Setup:**
```bash
# Example with Pinecone
npm install @pinecone-database/pinecone
```

#### **Expected API Endpoints:**
- `POST /api/rag/search` - Semantic search
- `GET /api/rag/policies` - Policy search
- `GET /api/rag/procedures` - Procedure search
- `GET /api/rag/faq` - FAQ search

#### **Sample Integration Code:**
```typescript
// Replace skeleton in src/ragSystem.ts
export async function queryCompanyKnowledge(query: RAGQuery): Promise<RAGResult[]> {
  const response = await fetch('/api/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });
  
  return await response.json();
}
```

### **📊 Knowledge Categories**

- **📋 Policies** - Refund, privacy, terms, shipping, support policies
- **🔧 Procedures** - Step-by-step troubleshooting and how-to guides  
- **❓ FAQ** - Frequently asked questions and quick answers
- **📚 Knowledge Base** - General company information and guidelines

---

## 🏷️ Thread Naming

### **🎯 Overview**

Automatic thread naming generates descriptive, ChatGPT-style titles for email conversations to improve organization and searchability.

### **✨ Features**

- **🧠 AI-Powered Analysis** - Understands email content and context
- **🏷️ Issue Type Detection** - Billing, technical, shipping, account issues
- **😊 Sentiment Awareness** - Incorporates customer emotional state
- **⚡ Urgency Recognition** - Identifies high-priority situations
- **🎛️ Customizable Options** - Length, customer names, issue types

### **🎯 Usage Examples**

#### **Basic Naming:**
```typescript
const naming = await generateThreadName({
  thread: emailThread,
  maxLength: 50
});

console.log(naming.name); // "billing - premium subscription activation issue"
```

#### **Advanced Naming:**
```typescript
const naming = await generateThreadName({
  thread: emailThread,
  maxLength: 60,
  includeCustomerName: true,
  includeIssueType: true
});

console.log(naming.name); // "john.doe: technical - premium features not accessible"
```

### **🎨 Naming Patterns**

- **Issue-focused**: `"billing - refund request for order #12345"`
- **Customer-focused**: `"john.doe: account access problems"`
- **Urgency-aware**: `"technical - login issues (URGENT)"`
- **Sentiment-aware**: `"billing issue (escalation needed)"`

---

## ⚙️ Configuration

### **🎛️ Agent Configuration**

```typescript
interface AgentConfig {
  model?: string;                    // OpenAI model (default: 'gpt-4o')
  includeRAG?: boolean;             // Enable RAG system (default: true)
  generateThreadName?: boolean;      // Generate thread names (default: true)
  maxRAGResults?: number;           // Max RAG results (default: 5)
  enableSentimentAnalysis?: boolean; // Enable sentiment detection (default: true)
  confidenceThreshold?: number;     // Min confidence for responses (default: 0.7)
  escalationKeywords?: string[];    // Custom escalation triggers
}
```

### **🎯 Configuration Examples**

#### **High-Performance Setup:**
```typescript
const config: AgentConfig = {
  model: 'gpt-4o',
  includeRAG: true,
  maxRAGResults: 10,
  confidenceThreshold: 0.9
};
```

#### **Cost-Optimized Setup:**
```typescript
const config: AgentConfig = {
  model: 'gpt-4o-mini',
  includeRAG: false,
  generateThreadName: false,
  maxRAGResults: 3
};
```

#### **Escalation-Focused Setup:**
```typescript
const config: AgentConfig = {
  enableSentimentAnalysis: true,
  escalationKeywords: [
    'legal', 'lawyer', 'attorney', 'sue',
    'manager', 'supervisor', 'escalate',
    'complaint', 'unacceptable', 'terrible'
  ]
};
```

---

## 🔧 Integration Guide

### **🏗️ Backend Integration**

#### **1. Email Thread API**
```typescript
// GET /api/threads/:id
interface EmailThreadAPI {
  getThread(id: string): Promise<EmailThread>;
  updateThread(id: string, updates: Partial<EmailThread>): Promise<EmailThread>;
  createThread(thread: Omit<EmailThread, 'id'>): Promise<EmailThread>;
}
```

#### **2. Customer Context API**
```typescript
// GET /api/customers/:email/context
interface CustomerContextAPI {
  getCustomerHistory(email: string): Promise<CustomerHistory>;
  getOrderHistory(customerId: string): Promise<OrderInfo[]>;
  getAccountDetails(customerId: string): Promise<AccountDetails>;
}
```

#### **3. RAG System API**
```typescript
// POST /api/rag/search
interface RAGSystemAPI {
  search(query: RAGQuery): Promise<RAGResult[]>;
  indexDocument(document: Document): Promise<void>;
  updateKnowledgeBase(): Promise<void>;
}
```

### **🗄️ Database Schema**

#### **Email Threads Table:**
```sql
CREATE TABLE email_threads (
  id VARCHAR(255) PRIMARY KEY,
  subject TEXT NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  status ENUM('open', 'pending', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  thread_name VARCHAR(255),
  sentiment VARCHAR(50),
  confidence DECIMAL(3,2),
  escalation_level VARCHAR(50),
  tags JSON,
  internal_notes JSON,
  custom_fields JSON
);
```

#### **Email Messages Table:**
```sql
CREATE TABLE email_messages (
  id VARCHAR(255) PRIMARY KEY,
  thread_id VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  to_emails JSON NOT NULL,
  cc_emails JSON,
  bcc_emails JSON,
  subject TEXT,
  body LONGTEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  is_from_customer BOOLEAN NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent'),
  attachments JSON,
  FOREIGN KEY (thread_id) REFERENCES email_threads(id)
);
```

### **⚡ Performance Considerations**

- **Thread Analysis**: 2-5 seconds per thread
- **RAG Queries**: 1-3 seconds (when implemented)
- **Thread Naming**: 1-2 seconds
- **OpenAI API Costs**: Monitor token usage and implement caching

---

## 🔄 Migration from v1.x

### **📋 Migration Checklist**

#### **✅ Quick Migration (Backward Compatible)**
```typescript
// OLD v1.x code continues to work
import { assistSupportPersonBasic } from 'proresponse-agent';

const response = await assistSupportPersonBasic(emailText, context, model);
```

#### **🚀 Full Migration to v2.x Enhanced**

**Step 1: Update Imports**
```typescript
// OLD
import { assistSupportPerson } from 'proresponse-agent';

// NEW
import { assistSupportPersonEnhanced, EmailThread } from 'proresponse-agent';
```

**Step 2: Convert Email Format**
```typescript
// OLD - Raw email text
const emailText = "Customer email content...";

// NEW - Structured email thread
const emailThread: EmailThread = {
  id: 'thread-123',
  subject: 'Customer issue',
  customerEmail: 'customer@example.com',
  status: 'open',
  priority: 'normal',
  createdAt: new Date(),
  updatedAt: new Date(),
  messages: [
    {
      id: 'msg-1',
      threadId: 'thread-123',
      from: 'customer@example.com',
      to: ['support@company.com'],
      subject: 'Customer issue',
      body: emailText, // Use existing email text
      timestamp: new Date(),
      isFromCustomer: true
    }
  ]
};
```

**Step 3: Update Function Calls**
```typescript
// OLD
const response = await assistSupportPerson(emailText, context, model);

// NEW
const response = await assistSupportPersonEnhanced(emailThread, structuredContext, config);
```

**Step 4: Handle Enhanced Response**
```typescript
// OLD response format
console.log(response.draft);
console.log(response.reasoning);

// NEW enhanced response format
console.log(response.draft);
console.log(response.reasoning);
console.log(response.threadName);        // NEW
console.log(response.confidence);        // NEW
console.log(response.suggestedPriority); // NEW
console.log(response.customerSentiment); // NEW
console.log(response.ragSources);        // NEW
```

### **🔧 Migration Utilities**

#### **Convert Raw Email to Thread**
```typescript
function convertEmailToThread(
  emailText: string, 
  customerEmail: string, 
  subject: string
): EmailThread {
  return {
    id: `thread-${Date.now()}`,
    subject,
    customerEmail,
    status: 'open',
    priority: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        threadId: `thread-${Date.now()}`,
        from: customerEmail,
        to: ['support@yourcompany.com'],
        subject,
        body: emailText,
        timestamp: new Date(),
        isFromCustomer: true
      }
    ]
  };
}
```

---

## 🏗️ Architecture

### **📊 System Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Email Thread  │    │  Enhanced Agent  │    │  RAG System     │
│   ┌───────────┐ │    │  ┌─────────────┐ │    │  ┌────────────┐ │
│   │ Messages  │ │───▶│  │ Thread      │ │◀───│  │ Knowledge  │ │
│   │ Metadata  │ │    │  │ Analysis    │ │    │  │ Base       │ │
│   │ Context   │ │    │  │ Sentiment   │ │    │  │ Policies   │ │
│   └───────────┘ │    │  │ Escalation  │ │    │  │ Procedures │ │
└─────────────────┘    │  │ Naming      │ │    │  └────────────┘ │
                       │  └─────────────┘ │    └─────────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Enhanced Response│
                       │ ┌─────────────┐  │
                       │ │ Draft       │  │
                       │ │ Reasoning   │  │
                       │ │ Thread Name │  │
                       │ │ Confidence  │  │
                       │ │ Priority    │  │
                       │ │ Sentiment   │  │
                       │ │ RAG Sources │  │
                       │ └─────────────┘  │
                       └──────────────────┘
```

### **🔧 Component Architecture**

#### **Core Modules:**
- **`agent.ts`** - Original basic agent (v1.x compatibility)
- **`enhancedAgent.ts`** - New enhanced agent with full capabilities
- **`ragSystem.ts`** - RAG integration skeleton functions
- **`threadNaming.ts`** - Automatic thread naming system
- **`tools.ts`** - Enhanced tool system (10 tools)
- **`types.ts`** - Comprehensive TypeScript interfaces

#### **Data Flow:**
1. **Input**: Email thread with customer context
2. **Analysis**: Thread content analysis and RAG queries
3. **Processing**: LLM analysis with specialized tools
4. **Enhancement**: Thread naming, sentiment analysis, escalation detection
5. **Output**: Enhanced response with comprehensive metadata

---

## 🛠️ Development

### **🚀 Getting Started**

```bash
# Clone repository
git clone https://github.com/your-repo/proresponse-agent.git
cd proresponse-agent

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your OpenAI API key

# Build project
npm run build

# Run examples
npm run example:enhanced
```

### **📜 Available Scripts**

```bash
npm run build           # Compile TypeScript
npm run dev             # Watch mode compilation
npm run clean           # Clean dist directory
npm run example         # Run basic example
npm run example:enhanced # Run enhanced example
npm run example:basic   # Run v1.x compatible example
```

### **🧪 Testing Examples**

```bash
# Test basic functionality
npm run example:basic

# Test enhanced functionality
npm run example:enhanced

# Test specific components
node -e "
const { generateThreadName } = require('./dist/index');
// Test thread naming
"
```

### **🔧 Adding New Features**

#### **Adding a New Tool:**

1. **Define tool in `src/tools.ts`:**
```typescript
{
  type: 'function' as const,
  function: {
    name: 'your_new_tool',
    description: 'What your tool does',
    parameters: {
      type: 'object',
      properties: {
        // Define parameters
      },
      required: ['param1']
    }
  }
}
```

2. **Add handler in `handleToolCall`:**
```typescript
case 'your_new_tool':
  console.log(`[Agent-Tools] Executing your new tool`);
  return await yourNewToolFunction(args);
```

#### **Extending RAG System:**

1. **Add new category to types:**
```typescript
type RAGCategory = 'policy' | 'knowledge' | 'procedure' | 'faq' | 'your_new_category';
```

2. **Create specialized query function:**
```typescript
export async function queryYourNewCategory(query: string): Promise<RAGResult[]> {
  // Implementation
}
```

### **📝 Code Style Guidelines**

- **Comprehensive Logging**: Use `console.log('[Module] message')` format
- **TypeScript First**: Full type safety with interfaces
- **Error Handling**: Proper try-catch with informative messages
- **Documentation**: JSDoc comments for all public functions
- **Modularity**: Keep functions focused and reusable

### **🐛 Debugging**

#### **Common Issues:**

**OpenAI API Errors:**
```typescript
// Check API key
console.log('API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');

// Test with simpler model
const config = { model: 'gpt-4o-mini' };
```

**TypeScript Compilation Errors:**
```bash
# Check TypeScript version
npx tsc --version

# Compile with verbose output
npx tsc --verbose
```

**Memory Issues with Large Threads:**
```typescript
// Limit message history
const limitedThread = {
  ...thread,
  messages: thread.messages.slice(-10) // Last 10 messages only
};
```

---

## ❓ FAQ

### **🔧 Technical Questions**

**Q: How do I integrate with my existing email system?**
A: Convert your email data to the `EmailThread` format. See the migration guide for conversion utilities.

**Q: Can I use my own knowledge base instead of the RAG skeleton?**
A: Yes! Replace the functions in `src/ragSystem.ts` with your own backend calls.

**Q: How much does it cost to run?**
A: Costs depend on OpenAI usage. Typical thread analysis uses 2,000-5,000 tokens (~$0.01-$0.05 per thread with GPT-4o).

**Q: Can I run this without internet access?**
A: No, it requires OpenAI API access. Consider using local LLMs for offline scenarios.

### **🚀 Feature Questions**

**Q: Can I customize the response tone?**
A: Yes! Modify the system prompt in `src/enhancedAgent.ts` or use configuration options.

**Q: How accurate is the sentiment analysis?**
A: Current implementation is pattern-based. For higher accuracy, integrate with specialized sentiment APIs.

**Q: Can I add my own escalation rules?**
A: Yes! Use the `escalationKeywords` configuration option or modify the detection logic.

**Q: How do I train the agent on my company's style?**
A: Add examples to the system prompt and integrate your company knowledge through the RAG system.

### **🔄 Migration Questions**

**Q: Do I need to rewrite my existing v1.x code?**
A: No! Use `assistSupportPersonBasic` for backward compatibility, then migrate gradually.

**Q: Can I use both v1.x and v2.x functions together?**
A: Yes! The library supports both simultaneously.

**Q: How do I convert my email strings to thread format?**
A: Use the conversion utilities in the migration guide or create threads programmatically.

### **🔧 Integration Questions**

**Q: What backend technologies do you recommend?**
A: Any REST API with vector database support (Pinecone, Weaviate, PostgreSQL with pgvector).

**Q: How do I handle real-time updates?**
A: Implement webhooks for email events and update threads asynchronously.

**Q: Can I deploy this serverlessly?**
A: Yes! Works great with AWS Lambda, Vercel Functions, or similar platforms.

---

## 📊 Performance & Monitoring

### **⚡ Performance Metrics**

- **Thread Analysis**: 2-5 seconds
- **RAG Queries**: 1-3 seconds (when implemented)
- **Thread Naming**: 1-2 seconds
- **Memory Usage**: ~50-100MB per instance
- **Concurrent Requests**: 10-50 (depending on OpenAI limits)

### **📈 Monitoring Recommendations**

```typescript
// Add performance monitoring
const startTime = Date.now();
const response = await assistSupportPersonEnhanced(thread);
const duration = Date.now() - startTime;

console.log(`[Performance] Thread analysis completed in ${duration}ms`);
console.log(`[Performance] Confidence: ${response.confidence}`);
console.log(`[Performance] RAG sources: ${response.ragSources?.length || 0}`);
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **🎯 Areas for Contribution**
- RAG system implementations
- Additional sentiment analysis methods
- New specialized tools
- Performance optimizations
- Documentation improvements

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### **📞 Getting Help**
- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Examples**: Run the example scripts for working demonstrations

### **🔗 Useful Links**
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

## 🚀 What's Next?

### **🔮 Planned Features (v2.1+)**
- **Multi-language Support** - International customer support
- **Advanced Analytics** - Response quality metrics and A/B testing
- **Template System** - Predefined response templates
- **Workflow Integration** - Slack, Teams, Zendesk integration
- **Real-time Collaboration** - Multi-agent support scenarios

### **🎯 Roadmap**
- **Q1 2024**: Multi-language support
- **Q2 2024**: Advanced analytics dashboard
- **Q3 2024**: Workflow integrations
- **Q4 2024**: Real-time collaboration features

---

**🎉 Ready to enhance your customer support with AI? Get started with the examples above!** 