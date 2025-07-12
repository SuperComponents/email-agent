/**
 * Event Type Mapping System
 * 
 * Maps agent tool names to database enum values for consistent data storage.
 * This resolves the mismatch between agent tool event types and database action enums.
 */

// Type definitions for agent tool names
export type AgentToolName = 
  | 'summarize_useful_context'
  | 'update_thread_urgency'
  | 'update_thread_category'
  | 'compose_draft'
  | 'compose-draft'
  | 'user_action_needed'
  | 'finalize_draft'
  | 'user_message';

// Import the database enum type
import { agentActionEnum } from '../database/schema.js';
export type DatabaseActionType = typeof agentActionEnum.enumValues[number];

// Mapping from agent tool names to database enum values
export const AGENT_TOOL_TO_DB_ACTION_MAP: Record<AgentToolName, DatabaseActionType> = {
  'summarize_useful_context': 'email_read', // Context analysis maps to email being read
  'update_thread_urgency': 'thread_status_changed', // Urgency updates are status changes
  'update_thread_category': 'thread_status_changed', // Category updates are status changes
  'compose_draft': 'draft_created', // Draft composition creates a draft
  'compose-draft': 'draft_created', // Handle both naming conventions
  'user_action_needed': 'thread_assigned', // User action needed maps to assignment
  'finalize_draft': 'draft_approved', // Finalizing draft maps to approval
  'user_message': 'internal_note_created', // User messages become internal notes
};

// Reverse mapping for debugging/logging purposes
export const DB_ACTION_TO_AGENT_TOOL_MAP: Record<DatabaseActionType, AgentToolName[]> = {
  'email_read': ['summarize_useful_context'],
  'email_forwarded': [],
  'draft_created': ['compose_draft', 'compose-draft'],
  'draft_edited': [],
  'draft_approved': ['finalize_draft'],
  'draft_rejected': [],
  'draft_sent': [],
  'thread_assigned': ['user_action_needed'],
  'thread_status_changed': ['update_thread_urgency', 'update_thread_category'],
  'thread_archived': [],
  'internal_note_created': ['user_message'],
  'internal_note_updated': [],
  'internal_note_deleted': [],
};

/**
 * Maps an agent tool name to the appropriate database action enum value
 */
export function mapAgentToolToDbAction(toolName: string): DatabaseActionType {
  const mappedAction = AGENT_TOOL_TO_DB_ACTION_MAP[toolName as AgentToolName];
  
  if (!mappedAction) {
    console.warn(`[EventMapping] No mapping found for agent tool: ${toolName}, defaulting to 'email_read'`);
    return 'email_read'; // Safe default
  }
  
  return mappedAction;
}

/**
 * Checks if an agent tool name is recognized
 */
export function isValidAgentTool(toolName: string): toolName is AgentToolName {
  return toolName in AGENT_TOOL_TO_DB_ACTION_MAP;
}

/**
 * Gets all valid agent tool names
 */
export function getAllValidAgentTools(): AgentToolName[] {
  return Object.keys(AGENT_TOOL_TO_DB_ACTION_MAP) as AgentToolName[];
}

/**
 * Gets all valid database action types
 */
export function getAllValidDbActions(): DatabaseActionType[] {
  return agentActionEnum.enumValues as DatabaseActionType[];
}