// Thread Naming System - Generate internal reference names for email threads
// SKELETON IMPLEMENTATION - Ready for integration with LLM-based naming

import { EmailThread, ThreadNamingRequest, ThreadNamingResponse } from './types';

/**
 * SKELETON: Generate an internal reference name for an email thread
 * Similar to how ChatGPT generates conversation titles
 * 
 * @param request - Thread naming request with configuration options
 * @returns Promise<ThreadNamingResponse> - Generated name with reasoning and alternatives
 */
export async function generateThreadName(request: ThreadNamingRequest): Promise<ThreadNamingResponse> {
  console.log(`[ThreadNaming-Skeleton] Generating name for thread: ${request.thread.id}`);
  console.log(`[ThreadNaming-Skeleton] Thread has ${request.thread.messages.length} messages`);
  console.log(`[ThreadNaming-Skeleton] Customer: ${request.thread.customerEmail}`);
  console.log(`[ThreadNaming-Skeleton] Priority: ${request.thread.priority}`);
  
  const { thread, maxLength = 50, includeCustomerName = false, includeIssueType = true } = request;
  
  // SKELETON: Analyze thread content for naming
  const analysisResult = await analyzeThreadForNaming(thread);
  console.log(`[ThreadNaming-Skeleton] Analysis complete - Issue type: ${analysisResult.detectedIssueType}`);
  console.log(`[ThreadNaming-Skeleton] Key topics: ${analysisResult.keyTopics.join(', ')}`);
  
  // SKELETON: Generate primary name
  const primaryName = buildThreadName(analysisResult, {
    maxLength,
    includeCustomerName,
    includeIssueType,
    customerEmail: thread.customerEmail
  });
  
  console.log(`[ThreadNaming-Skeleton] Primary name generated: "${primaryName}"`);
  
  // SKELETON: Generate alternative names
  const alternativeNames = generateAlternativeNames(analysisResult, {
    maxLength,
    includeCustomerName,
    includeIssueType,
    customerEmail: thread.customerEmail
  });
  
  console.log(`[ThreadNaming-Skeleton] Generated ${alternativeNames.length} alternative names`);
  
  // SKELETON: Calculate confidence based on content analysis
  const confidence = calculateNamingConfidence(analysisResult, thread);
  console.log(`[ThreadNaming-Skeleton] Naming confidence: ${(confidence * 100).toFixed(1)}%`);
  
  const response: ThreadNamingResponse = {
    name: primaryName,
    reasoning: `SKELETON: Generated based on ${analysisResult.detectedIssueType} issue type with key topics: ${analysisResult.keyTopics.join(', ')}. Customer sentiment appears ${analysisResult.sentiment}. Used ${thread.messages.length} messages for analysis.`,
    confidence,
    alternativeNames,
    detectedIssueType: analysisResult.detectedIssueType,
    keyTopics: analysisResult.keyTopics
  };
  
  console.log(`[ThreadNaming-Skeleton] Thread naming completed successfully`);
  
  return response;
}

/**
 * Internal interface for thread analysis results
 */
interface ThreadAnalysis {
  detectedIssueType: string;
  keyTopics: string[];
  primaryKeywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry';
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent';
  contentSummary: string;
  customerAction: string; // What the customer is trying to do
}

/**
 * SKELETON: Analyze thread content to extract naming information
 * This will be enhanced with LLM analysis when implemented
 * 
 * @param thread - Email thread to analyze
 * @returns Promise<ThreadAnalysis> - Analysis results for naming
 */
async function analyzeThreadForNaming(thread: EmailThread): Promise<ThreadAnalysis> {
  console.log(`[ThreadNaming-Skeleton] Analyzing thread content for naming patterns`);
  
  // SKELETON: Combine all message content for analysis
  const allContent = thread.messages
    .map(msg => `${msg.subject} ${msg.body}`)
    .join(' ')
    .toLowerCase();
  
  console.log(`[ThreadNaming-Skeleton] Combined content length: ${allContent.length} characters`);
  
  // SKELETON: Basic issue type detection (to be replaced with LLM analysis)
  const detectedIssueType = detectIssueType(allContent);
  console.log(`[ThreadNaming-Skeleton] Detected issue type: ${detectedIssueType}`);
  
  // SKELETON: Extract key topics and keywords
  const keyTopics = extractKeyTopics(allContent);
  const primaryKeywords = extractPrimaryKeywords(allContent);
  
  console.log(`[ThreadNaming-Skeleton] Extracted ${keyTopics.length} key topics: ${keyTopics.join(', ')}`);
  console.log(`[ThreadNaming-Skeleton] Extracted ${primaryKeywords.length} primary keywords`);
  
  // SKELETON: Basic sentiment analysis (to be replaced with LLM)
  const sentiment = detectSentiment(allContent);
  console.log(`[ThreadNaming-Skeleton] Detected sentiment: ${sentiment}`);
  
  // SKELETON: Determine urgency level
  const urgencyLevel = determineUrgency(allContent, thread.priority);
  console.log(`[ThreadNaming-Skeleton] Determined urgency: ${urgencyLevel}`);
  
  // SKELETON: Generate content summary
  const contentSummary = generateContentSummary(allContent, keyTopics);
  
  // SKELETON: Determine customer action
  const customerAction = detectCustomerAction(allContent);
  console.log(`[ThreadNaming-Skeleton] Customer action: ${customerAction}`);
  
  return {
    detectedIssueType,
    keyTopics,
    primaryKeywords,
    sentiment,
    urgencyLevel,
    contentSummary,
    customerAction
  };
}

/**
 * SKELETON: Detect the primary issue type from content
 * 
 * @param content - Combined thread content
 * @returns string - Detected issue type
 */
function detectIssueType(content: string): string {
  console.log(`[ThreadNaming-Skeleton] Detecting issue type from content patterns`);
  
  // SKELETON: Pattern-based detection (to be replaced with LLM classification)
  const issuePatterns = {
    'billing': ['billing', 'payment', 'charge', 'invoice', 'subscription', 'refund', 'cancel'],
    'technical': ['bug', 'error', 'not working', 'broken', 'issue', 'problem', 'login', 'access'],
    'account': ['account', 'profile', 'settings', 'password', 'username', 'verification'],
    'shipping': ['shipping', 'delivery', 'order', 'tracking', 'package', 'arrived'],
    'feature_request': ['feature', 'request', 'enhancement', 'suggestion', 'improvement'],
    'general_inquiry': ['question', 'help', 'information', 'how to', 'wondering']
  };
  
  let bestMatch = 'general_inquiry';
  let maxMatches = 0;
  
  for (const [issueType, keywords] of Object.entries(issuePatterns)) {
    const matches = keywords.filter(keyword => content.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = issueType;
    }
  }
  
  console.log(`[ThreadNaming-Skeleton] Issue type detected: ${bestMatch} (${maxMatches} keyword matches)`);
  
  return bestMatch;
}

/**
 * SKELETON: Extract key topics from content
 * 
 * @param content - Combined thread content
 * @returns string[] - Key topics
 */
function extractKeyTopics(content: string): string[] {
  console.log(`[ThreadNaming-Skeleton] Extracting key topics from content`);
  
  // SKELETON: Simple topic extraction (to be replaced with NLP/LLM analysis)
  const topicKeywords = [
    'premium', 'subscription', 'account', 'billing', 'payment', 'refund',
    'features', 'access', 'login', 'password', 'order', 'shipping',
    'delivery', 'bug', 'error', 'support', 'help'
  ];
  
  const foundTopics = topicKeywords.filter(topic => content.includes(topic));
  
  console.log(`[ThreadNaming-Skeleton] Found topics: ${foundTopics.join(', ')}`);
  
  return foundTopics.slice(0, 3); // Limit to top 3 topics
}

/**
 * SKELETON: Extract primary keywords for naming
 * 
 * @param content - Combined thread content
 * @returns string[] - Primary keywords
 */
function extractPrimaryKeywords(content: string): string[] {
  console.log(`[ThreadNaming-Skeleton] Extracting primary keywords for naming`);
  
  // SKELETON: Basic keyword extraction
  const words = content.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'been', 'will', 'your', 'them'].includes(word));
  
  // Count frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get top keywords by frequency
  const sortedKeywords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  console.log(`[ThreadNaming-Skeleton] Primary keywords: ${sortedKeywords.join(', ')}`);
  
  return sortedKeywords;
}

/**
 * SKELETON: Detect sentiment from content
 * 
 * @param content - Combined thread content
 * @returns string - Detected sentiment
 */
function detectSentiment(content: string): 'positive' | 'neutral' | 'negative' | 'frustrated' | 'angry' {
  console.log(`[ThreadNaming-Skeleton] Detecting sentiment from content`);
  
  // SKELETON: Basic sentiment detection (to be replaced with LLM analysis)
  const positiveWords = ['thank', 'appreciate', 'great', 'excellent', 'good', 'happy'];
  const negativeWords = ['problem', 'issue', 'broken', 'bug', 'error', 'frustrated', 'angry'];
  const frustratedWords = ['urgently', 'asap', 'immediately', 'still not working', 'disappointed'];
  
  const positiveCount = positiveWords.filter(word => content.includes(word)).length;
  const negativeCount = negativeWords.filter(word => content.includes(word)).length;
  const frustratedCount = frustratedWords.filter(word => content.includes(word)).length;
  
  if (frustratedCount > 0) return 'frustrated';
  if (negativeCount > positiveCount && negativeCount > 0) return 'negative';
  if (positiveCount > 0) return 'positive';
  
  console.log(`[ThreadNaming-Skeleton] Sentiment: neutral (pos: ${positiveCount}, neg: ${negativeCount}, frust: ${frustratedCount})`);
  
  return 'neutral';
}

/**
 * SKELETON: Determine urgency level
 * 
 * @param content - Combined thread content
 * @param threadPriority - Thread priority setting
 * @returns string - Urgency level
 */
function determineUrgency(content: string, threadPriority: string): 'low' | 'normal' | 'high' | 'urgent' {
  console.log(`[ThreadNaming-Skeleton] Determining urgency level`);
  
  // Use thread priority if explicitly set
  if (['low', 'normal', 'high', 'urgent'].includes(threadPriority)) {
    console.log(`[ThreadNaming-Skeleton] Using explicit thread priority: ${threadPriority}`);
    return threadPriority as any;
  }
  
  // SKELETON: Detect urgency from content
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
  const highKeywords = ['soon', 'quickly', 'fast', 'priority'];
  
  if (urgentKeywords.some(keyword => content.includes(keyword))) {
    console.log(`[ThreadNaming-Skeleton] Detected urgent keywords`);
    return 'urgent';
  }
  
  if (highKeywords.some(keyword => content.includes(keyword))) {
    console.log(`[ThreadNaming-Skeleton] Detected high priority keywords`);
    return 'high';
  }
  
  console.log(`[ThreadNaming-Skeleton] No urgency indicators found, using normal priority`);
  return 'normal';
}

/**
 * SKELETON: Generate content summary
 * 
 * @param content - Combined thread content
 * @param keyTopics - Extracted key topics
 * @returns string - Content summary
 */
function generateContentSummary(content: string, keyTopics: string[]): string {
  console.log(`[ThreadNaming-Skeleton] Generating content summary`);
  
  // SKELETON: Basic summary generation
  const summary = `Customer inquiry about ${keyTopics.join(', ')} with ${content.length} characters of content`;
  
  console.log(`[ThreadNaming-Skeleton] Generated summary: ${summary}`);
  
  return summary;
}

/**
 * SKELETON: Detect what the customer is trying to do
 * 
 * @param content - Combined thread content
 * @returns string - Customer action
 */
function detectCustomerAction(content: string): string {
  console.log(`[ThreadNaming-Skeleton] Detecting customer action intent`);
  
  // SKELETON: Pattern-based action detection
  const actionPatterns = {
    'request_refund': ['refund', 'money back', 'cancel order'],
    'report_bug': ['bug', 'error', 'not working', 'broken'],
    'request_help': ['help', 'how to', 'assistance', 'support'],
    'ask_question': ['question', 'wondering', 'curious', 'information'],
    'make_complaint': ['complaint', 'disappointed', 'frustrated', 'problem'],
    'request_feature': ['feature', 'enhancement', 'suggestion', 'improvement']
  };
  
  for (const [action, keywords] of Object.entries(actionPatterns)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      console.log(`[ThreadNaming-Skeleton] Detected customer action: ${action}`);
      return action;
    }
  }
  
  console.log(`[ThreadNaming-Skeleton] No specific action detected, using general_inquiry`);
  return 'general_inquiry';
}

/**
 * SKELETON: Build the primary thread name
 * 
 * @param analysis - Thread analysis results
 * @param options - Naming options
 * @returns string - Generated thread name
 */
function buildThreadName(
  analysis: ThreadAnalysis,
  options: {
    maxLength: number;
    includeCustomerName: boolean;
    includeIssueType: boolean;
    customerEmail: string;
  }
): string {
  console.log(`[ThreadNaming-Skeleton] Building primary thread name with options:`, options);
  
  let name = '';
  
  // Add customer name if requested
  if (options.includeCustomerName) {
    const customerName = options.customerEmail.split('@')[0];
    name += `${customerName}: `;
  }
  
  // Add issue type if requested
  if (options.includeIssueType) {
    name += `${analysis.detectedIssueType.replace('_', ' ')} - `;
  }
  
  // Add primary topic or summary
  if (analysis.keyTopics.length > 0) {
    name += analysis.keyTopics[0];
  } else {
    name += 'General inquiry';
  }
  
  // Add urgency indicator if high or urgent
  if (analysis.urgencyLevel === 'urgent') {
    name += ' (URGENT)';
  } else if (analysis.urgencyLevel === 'high') {
    name += ' (HIGH)';
  }
  
  // Truncate if too long
  if (name.length > options.maxLength) {
    name = name.substring(0, options.maxLength - 3) + '...';
  }
  
  console.log(`[ThreadNaming-Skeleton] Built primary name: "${name}"`);
  
  return name;
}

/**
 * SKELETON: Generate alternative thread names
 * 
 * @param analysis - Thread analysis results
 * @param options - Naming options
 * @returns string[] - Alternative names
 */
function generateAlternativeNames(
  analysis: ThreadAnalysis,
  options: {
    maxLength: number;
    includeCustomerName: boolean;
    includeIssueType: boolean;
    customerEmail: string;
  }
): string[] {
  console.log(`[ThreadNaming-Skeleton] Generating alternative thread names`);
  
  const alternatives: string[] = [];
  
  // Alternative 1: Topic-focused
  if (analysis.keyTopics.length > 1) {
    alternatives.push(`${analysis.keyTopics.slice(0, 2).join(' & ')} inquiry`);
  }
  
  // Alternative 2: Action-focused
  alternatives.push(`Customer ${analysis.customerAction.replace('_', ' ')}`);
  
  // Alternative 3: Sentiment-aware
  if (analysis.sentiment === 'frustrated' || analysis.sentiment === 'angry') {
    alternatives.push(`${analysis.detectedIssueType} issue (escalation needed)`);
  }
  
  // Truncate alternatives if needed
  const truncatedAlternatives = alternatives.map(alt => 
    alt.length > options.maxLength 
      ? alt.substring(0, options.maxLength - 3) + '...'
      : alt
  );
  
  console.log(`[ThreadNaming-Skeleton] Generated ${truncatedAlternatives.length} alternatives`);
  
  return truncatedAlternatives;
}

/**
 * SKELETON: Calculate confidence in the generated name
 * 
 * @param analysis - Thread analysis results
 * @param thread - Original thread
 * @returns number - Confidence score (0-1)
 */
function calculateNamingConfidence(analysis: ThreadAnalysis, thread: EmailThread): number {
  console.log(`[ThreadNaming-Skeleton] Calculating naming confidence`);
  
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on factors
  if (analysis.keyTopics.length > 0) confidence += 0.2;
  if (analysis.detectedIssueType !== 'general_inquiry') confidence += 0.2;
  if (thread.messages.length > 1) confidence += 0.1; // More context = higher confidence
  if (analysis.primaryKeywords.length > 2) confidence += 0.1;
  
  // Cap at 1.0
  confidence = Math.min(confidence, 1.0);
  
  console.log(`[ThreadNaming-Skeleton] Calculated confidence: ${(confidence * 100).toFixed(1)}%`);
  
  return confidence;
}

/**
 * SKELETON: Quick thread name generation (simplified version)
 * For cases where a simple name is needed without full analysis
 * 
 * @param thread - Email thread
 * @returns Promise<string> - Simple generated name
 */
export async function generateQuickThreadName(thread: EmailThread): Promise<string> {
  console.log(`[ThreadNaming-Skeleton] Generating quick thread name for thread: ${thread.id}`);
  
  // Use the subject line as a starting point
  let name = thread.subject;
  
  // Remove common email prefixes
  name = name.replace(/^(re:|fwd?:|fw:)\s*/i, '').trim();
  
  // Truncate if too long
  if (name.length > 50) {
    name = name.substring(0, 47) + '...';
  }
  
  // Fallback to generic name if subject is empty/generic
  if (!name || name.length < 5 || name.toLowerCase() === 'no subject') {
    name = `Support request from ${thread.customerEmail.split('@')[0]}`;
  }
  
  console.log(`[ThreadNaming-Skeleton] Quick name generated: "${name}"`);
  
  return name;
} 