/**
 * Agent Tool Metadata Type Definitions
 * 
 * Defines TypeScript interfaces for metadata returned by each agent tool.
 * This ensures consistency between tool outputs and frontend expectations.
 */

// Base interface for all agent tool metadata
export interface BaseAgentMetadata {
  timestamp?: string;
  confidence?: number;
  tool_version?: string;
}

// Metadata for summarize_useful_context tool
export interface SummarizeContextMetadata extends BaseAgentMetadata {
  summary: string;
  key_points: string[];
  recommended_actions: string[];
  context_sources?: string[];
  relevance_score?: number;
}

// Metadata for update_thread_urgency tool
export interface UpdateUrgencyMetadata extends BaseAgentMetadata {
  thread_id: string;
  old_urgency: string;
  new_urgency: 'low' | 'medium' | 'high' | 'urgent';
  urgency_reason?: string;
  auto_escalation?: boolean;
}

// Metadata for update_thread_category tool
export interface UpdateCategoryMetadata extends BaseAgentMetadata {
  thread_id: string;
  old_category: string;
  new_category: string;
  category_confidence?: number;
  suggested_tags?: string[];
}

// Metadata for compose_draft tools (both variants)
export interface ComposeDraftMetadata extends BaseAgentMetadata {
  subject: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  confidence_score?: number;
  tone?: 'professional' | 'friendly' | 'apologetic' | 'urgent' | 'empathetic' | 'technical';
  email_type?: 'support' | 'billing' | 'feature_request' | 'bug_report' | 'feedback' | 'general';
  customer_sentiment?: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'satisfied';
  escalation_recommended?: boolean;
  estimated_response_time?: string;
  rag_sources_used?: number;
  suggestions?: string[];
}

// Metadata for user_action_needed tool
export interface UserActionNeededMetadata extends BaseAgentMetadata {
  thread_id: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggested_actions?: string[];
  escalation_type?: 'technical' | 'billing' | 'management' | 'legal';
  estimated_resolution_time?: string;
}

// Metadata for finalize_draft tool
export interface FinalizeDraftMetadata extends BaseAgentMetadata {
  thread_id: string;
  final_draft: string;
  ready_to_send: boolean;
  include_signature?: boolean;
  final_confidence?: number;
  review_notes?: string[];
}

// Metadata for user_message events
export interface UserMessageMetadata extends BaseAgentMetadata {
  message: string;
  user_id?: string;
  context?: string;
  intent?: 'instruction' | 'feedback' | 'question' | 'request';
}

// Union type for all possible metadata structures
export type AgentToolMetadata = 
  | SummarizeContextMetadata
  | UpdateUrgencyMetadata
  | UpdateCategoryMetadata
  | ComposeDraftMetadata
  | UserActionNeededMetadata
  | FinalizeDraftMetadata
  | UserMessageMetadata;

// Enhanced metadata interface that matches frontend expectations
export interface EnhancedAgentMetadata {
  // Core metadata fields
  confidence?: number;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'satisfied' | null;
  escalation_recommended?: boolean;
  suggested_priority?: 'low' | 'medium' | 'high' | 'urgent' | null;
  rag_sources_used?: number;
  
  // Extended fields for better display
  tool_name?: string;
  tool_input?: Record<string, any>;
  tool_output?: Record<string, any>;
  processing_time_ms?: number;
  
  // Legacy fields for backwards compatibility
  confidence_score?: string | number;
  customer_sentiment?: string;
  rag_sources_count?: number;
}

/**
 * Type guard to check if metadata is from a specific tool
 */
export function isComposeDraftMetadata(metadata: AgentToolMetadata): metadata is ComposeDraftMetadata {
  return 'subject' in metadata && 'body' in metadata && 'priority' in metadata;
}

export function isUpdateUrgencyMetadata(metadata: AgentToolMetadata): metadata is UpdateUrgencyMetadata {
  return 'old_urgency' in metadata && 'new_urgency' in metadata;
}

export function isUserActionNeededMetadata(metadata: AgentToolMetadata): metadata is UserActionNeededMetadata {
  return 'reason' in metadata && 'priority' in metadata && 'thread_id' in metadata;
}

/**
 * Converts tool-specific metadata to enhanced metadata format expected by frontend
 */
export function convertToEnhancedMetadata(
  toolName: string,
  toolMetadata: Record<string, any>
): EnhancedAgentMetadata {
  const enhanced: EnhancedAgentMetadata = {
    tool_name: toolName,
    tool_input: {},
    tool_output: toolMetadata,
  };

  // Extract common fields based on tool type
  switch (toolName) {
    case 'compose_draft':
    case 'compose-draft':
      if (isComposeDraftMetadata(toolMetadata as AgentToolMetadata)) {
        enhanced.confidence = toolMetadata.confidence_score || toolMetadata.confidence;
        enhanced.sentiment = toolMetadata.customer_sentiment || null;
        enhanced.escalation_recommended = toolMetadata.escalation_recommended || false;
        enhanced.suggested_priority = toolMetadata.priority;
        enhanced.rag_sources_used = toolMetadata.rag_sources_used || 0;
      }
      break;
      
    case 'update_thread_urgency':
      if (isUpdateUrgencyMetadata(toolMetadata as AgentToolMetadata)) {
        enhanced.suggested_priority = toolMetadata.new_urgency;
        enhanced.escalation_recommended = toolMetadata.auto_escalation || false;
      }
      break;
      
    case 'user_action_needed':
      if (isUserActionNeededMetadata(toolMetadata as AgentToolMetadata)) {
        enhanced.escalation_recommended = true;
        enhanced.suggested_priority = toolMetadata.priority;
      }
      break;
      
    default:
      // Extract any matching fields generically
      enhanced.confidence = toolMetadata.confidence || toolMetadata.confidence_score;
      enhanced.sentiment = toolMetadata.sentiment || toolMetadata.customer_sentiment;
      enhanced.escalation_recommended = toolMetadata.escalation_recommended || false;
      enhanced.suggested_priority = toolMetadata.priority || toolMetadata.suggested_priority;
      enhanced.rag_sources_used = toolMetadata.rag_sources_used || toolMetadata.rag_sources_count || 0;
  }

  // Add legacy fields for backwards compatibility
  enhanced.confidence_score = enhanced.confidence;
  enhanced.customer_sentiment = enhanced.sentiment || undefined;
  enhanced.rag_sources_count = enhanced.rag_sources_used;

  return enhanced;
}