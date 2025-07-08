// Types and interfaces for the expanded ProResponse Agent system

/**
 * Represents an individual email in a thread
 */
export interface EmailMessage {
  id: string;                    // Unique identifier for this email
  threadId: string;              // Thread this email belongs to
  from: string;                  // Sender email address
  to: string[];                  // Recipient email addresses
  cc?: string[];                 // CC recipients (optional)
  bcc?: string[];                // BCC recipients (optional)
  subject: string;               // Email subject line
  body: string;                  // Email body content
  timestamp: Date;               // When the email was sent
  isFromCustomer: boolean;       // True if from customer, false if from support
  attachments?: Attachment[];    // Optional file attachments
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Email priority level
}

/**
 * Represents a file attachment in an email
 */
export interface Attachment {
  id: string;                    // Unique identifier
  filename: string;              // Original filename
  mimeType: string;              // MIME type (e.g., 'application/pdf')
  size: number;                  // File size in bytes
  url?: string;                  // Download URL (if available)
}

/**
 * Represents a complete email thread/conversation
 */
export interface EmailThread {
  id: string;                    // Unique thread identifier
  subject: string;               // Original subject line
  messages: EmailMessage[];     // All messages in chronological order
  customerEmail: string;         // Primary customer email address
  status: 'open' | 'pending' | 'resolved' | 'closed'; // Thread status
  priority: 'low' | 'normal' | 'high' | 'urgent'; // Thread priority
  tags?: string[];               // Optional tags for categorization
  assignedTo?: string;           // Support agent assigned to thread
  createdAt: Date;              // When thread was created
  updatedAt: Date;              // When thread was last updated
  internalNotes?: string[];     // Internal notes from support team
  customFields?: Record<string, any>; // Flexible custom data
}

/**
 * Context information for the support agent
 */
export interface SupportContext {
  customerHistory?: CustomerHistory;    // Customer's interaction history
  orderInformation?: OrderInfo[];       // Related orders/transactions
  accountDetails?: AccountDetails;      // Customer account information
  escalationLevel?: 'none' | 'tier1' | 'tier2' | 'manager'; // Escalation status
  urgencyReason?: string;              // Why this is urgent (if applicable)
  internalNotes?: string[];            // Additional context from support person
  relatedThreads?: string[];           // IDs of related email threads
}

/**
 * Customer interaction history
 */
export interface CustomerHistory {
  customerId: string;
  totalTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // in hours
  satisfactionScore?: number;    // 1-5 rating
  lastInteraction?: Date;
  commonIssues?: string[];       // Frequently reported issues
  preferredContactMethod?: 'email' | 'phone' | 'chat';
}

/**
 * Order/transaction information
 */
export interface OrderInfo {
  orderId: string;
  productName: string;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  shippingAddress?: string;
  trackingNumber?: string;
}

/**
 * Customer account details
 */
export interface AccountDetails {
  customerId: string;
  email: string;
  name: string;
  accountType: 'free' | 'premium' | 'enterprise';
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'trial';
  joinDate: Date;
  lastLogin?: Date;
  billingStatus?: 'current' | 'overdue' | 'suspended';
}

/**
 * RAG (Retrieval-Augmented Generation) query request
 */
export interface RAGQuery {
  query: string;                 // The search query
  category?: 'policy' | 'knowledge' | 'procedure' | 'faq' | 'all'; // Content category
  maxResults?: number;           // Maximum number of results (default: 5)
  relevanceThreshold?: number;   // Minimum relevance score (0-1)
  includeMetadata?: boolean;     // Include document metadata in results
}

/**
 * RAG system response with retrieved information
 */
export interface RAGResult {
  id: string;                    // Unique identifier for the retrieved content
  title: string;                 // Document/section title
  content: string;               // The actual content/text
  category: 'policy' | 'knowledge' | 'procedure' | 'faq' | 'other'; // Content type
  relevanceScore: number;        // Relevance score (0-1)
  lastUpdated: Date;            // When this content was last updated
  source: string;               // Source document/system
  url?: string;                 // Link to full document (if available)
  tags?: string[];              // Content tags for categorization
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Enhanced agent response with thread naming and RAG integration
 */
export interface EnhancedAgentResponse {
  draft: string;                 // The drafted email response
  reasoning: string;             // Agent's reasoning process
  threadName: string;            // Generated internal reference name for the thread
  confidence: number;            // Confidence in the response (0-1)
  suggestedPriority?: 'low' | 'normal' | 'high' | 'urgent'; // Suggested priority
  escalationRecommended?: boolean; // Whether escalation is recommended
  followUpRequired?: boolean;    // Whether follow-up is needed
  estimatedResolutionTime?: number; // Estimated time to resolve (hours)
  ragSources?: RAGResult[];     // Sources from RAG system used in response
  additionalActions?: string[]; // Additional actions the support person should take
  customerSentiment?: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry'; // Detected sentiment
  tags?: string[];              // Suggested tags for the thread
}

/**
 * Configuration for the enhanced agent
 */
export interface AgentConfig {
  model?: string;                // OpenAI model to use
  includeRAG?: boolean;         // Whether to use RAG system
  generateThreadName?: boolean;  // Whether to generate thread names
  maxRAGResults?: number;       // Maximum RAG results to include
  enableSentimentAnalysis?: boolean; // Whether to analyze customer sentiment
  confidenceThreshold?: number; // Minimum confidence for auto-responses
  escalationKeywords?: string[]; // Keywords that trigger escalation recommendations
}

/**
 * Thread naming request for the agent
 */
export interface ThreadNamingRequest {
  thread: EmailThread;           // The email thread to name
  maxLength?: number;           // Maximum name length (default: 50)
  includeCustomerName?: boolean; // Include customer name in the title
  includeIssueType?: boolean;   // Include detected issue type
}

/**
 * Thread naming response
 */
export interface ThreadNamingResponse {
  name: string;                 // Generated thread name
  reasoning: string;            // Why this name was chosen
  confidence: number;           // Confidence in the naming (0-1)
  alternativeNames?: string[];  // Alternative name suggestions
  detectedIssueType?: string;   // Detected type of issue/request
  keyTopics?: string[];         // Key topics identified in the thread
} 