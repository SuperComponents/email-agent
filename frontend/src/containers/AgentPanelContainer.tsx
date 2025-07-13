import { useEffect, useRef } from 'react';
import { useAgentActivity, queryKeys } from '../repo/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../stores/ui-store';
import { AgentPanel } from '../components/organisms';
import { FileSearch, Brain, MessageSquare, Zap, FileText, AlertTriangle, Users } from 'lucide-react';
import type { AgentActionProps } from '../components/molecules/AgentAction';
import { apiClient } from '../lib/api';

// Types for function call arguments
interface WriteDraftArgs {
  emailId: number;
  threadId: number;
  messageBody: string;
  citationFilename?: string;
  citationScore?: number;
  citationText?: string;
  confidence?: number;
}

interface TagEmailArgs {
  emailId: string;
  tags: string[];
  confidence?: number;
}

interface GetCustomerHistoryArgs {
  senderEmail: string;
  limit?: number;
}

interface SearchCustomerEmailsArgs {
  senderEmail: string;
  searchQuery: string;
  limit?: number;
}

interface SearchKnowledgeBaseArgs {
  query: string;
}

interface ExplainNextToolCallArgs {
  explanation: string;
  nextToolName: string;
}

interface FileSearchProviderData {
  queries: string[];
  [key: string]: unknown;
}

// Helper function to get appropriate icon for action types
function getIconForAction(actionType: string, toolName?: string) {
  // Tool-specific icons
  if (toolName === 'update_thread_urgency') return Zap;
  if (toolName === 'update_thread_category') return FileText;
  if (toolName === 'user_action_needed') return AlertTriangle;
  if (toolName === 'compose-draft' || toolName === 'compose_draft') return FileText;
  if (toolName === 'summarize_useful_context') return Brain;
  if (toolName === 'search-knowledge-base') return FileSearch;

  // Database action type icons
  switch (actionType) {
    case 'thread_status_changed':
      return Zap;
    case 'draft_created':
      return FileText;
    case 'email_read':
      return MessageSquare;
    case 'thread_assigned':
      return Users;
    case 'internal_note_created':
      return MessageSquare;
    default:
      return Brain;
  }
}

export interface AgentPanelContainerProps {
  onUseAgent?: () => void;
  onDemoCustomerResponse?: () => void;
  isRegeneratingDraft?: boolean;
  isGeneratingDemoResponse?: boolean;
  onDraftClick?: (draft: { body: string }) => void;
}

export function AgentPanelContainer({
  onUseAgent,
  onDemoCustomerResponse,
  isRegeneratingDraft,
  isGeneratingDemoResponse,
  onDraftClick,
}: AgentPanelContainerProps) {
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const isAgentPanelOpen = useUIStore(state => state.isAgentPanelOpen);
  const queryClient = useQueryClient();
  const seenWriteDraftIds = useRef<Set<string>>(new Set());

  const { data: agentActivity } = useAgentActivity(selectedThreadId || '');

  // Check for NEW write_draft function call results and refetch draft
  useEffect(() => {
    if (agentActivity && agentActivity.actions && selectedThreadId) {
      // Find write_draft results we haven't seen before
      const newWriteDraftResults = agentActivity.actions.filter(
        action =>
          action.result?.type === 'function_call_result' &&
          action.result?.name === 'write_draft' &&
          !seenWriteDraftIds.current.has(action.id),
      );

      if (newWriteDraftResults.length > 0) {
        // Mark these as seen
        newWriteDraftResults.forEach(action => {
          seenWriteDraftIds.current.add(action.id);
        });

        // Refetch the draft when we see a new write_draft result
        void queryClient.invalidateQueries({
          queryKey: queryKeys.draft(selectedThreadId),
        });
      }
    }
  }, [agentActivity, selectedThreadId, queryClient]);

  // Clear seen IDs when thread changes
  useEffect(() => {
    seenWriteDraftIds.current.clear();
  }, [selectedThreadId]);

  // Log agent activity when it comes in
//   if (agentActivity && agentActivity.actions) {
//     const resultsLog = agentActivity.actions
//       .map((action, index) => {
//         return (
//           `\n========== Action ${index} ==========\n` +
//           `ID: ${action.id}\n` +
//           `Type: ${action.type}\n` +
//           `Title: ${action.title}\n` +
//           `Status: ${action.status}\n` +
//           `Timestamp: ${action.timestamp}\n` +
//           `Result: ${action.result ? JSON.stringify(action.result, null, 2) : 'null'}\n`
//         );
//       })
//       .join('\n');
// 
//     console.log('=== AGENT ACTIVITY RESULTS ===\n' + resultsLog + '\n=== END AGENT ACTIVITY ===');
//   }

  if (!isAgentPanelOpen || !selectedThreadId) {
    return null;
  }

  // Transform agent activity data to match component props
  // Reverse the array to show most recent at bottom
  const actionsReversed = agentActivity?.actions
    .slice() // Create a copy to avoid mutating the original
    .reverse(); // Reverse to show most recent at bottom

  // Note: we used to correlate function_call results with their follow-ups.
  // If needed in future this logic can be re-added, but it's currently unused.

  const actions: AgentActionProps[] = (
    actionsReversed?.map((action): AgentActionProps | null => {
      // Skip function_call_result items
      if (action.result?.type === 'function_call_result') {
        return null;
      }
      // Check if this is a message type
      const isMessage = action.result?.type === 'message';
      const isExplainToolCall = action.result?.name === 'explain_next_tool_call';

      if (isMessage) {
        // For messages, extract content from result
        const messageContent = action.result?.content?.[0]?.text || '';
        const messageRole = action.result?.role as 'user' | 'assistant' | undefined;

        return {
          icon: MessageSquare,
          title: action.title,
          description: messageContent,
          timestamp: new Date(action.timestamp).toLocaleTimeString(),
          status:
            action.status === 'completed'
              ? 'completed'
              : action.status === 'failed'
              ? 'failed'
              : 'pending',
          isMessage: true,
          messageRole: messageRole || 'assistant',
        };
      }

      if (isExplainToolCall) {
        // For explain_next_tool_call, parse the JSON arguments
        let messageContent = '';
        try {
          const argumentsText = action.result?.arguments;
          if (argumentsText) {
            const parsed = JSON.parse(argumentsText) as ExplainNextToolCallArgs;
            messageContent = parsed.explanation || '';
          }
        } catch (e) {
          console.error('Failed to parse explain_next_tool_call arguments:', e);
          messageContent = (action.result?.arguments as string) || '';
        }

        return {
          icon: MessageSquare,
          title: action.title,
          description: messageContent,
          timestamp: new Date(action.timestamp).toLocaleTimeString(),
          status:
            action.status === 'completed'
              ? 'completed'
              : action.status === 'failed'
              ? 'failed'
              : 'pending',
          isMessage: true,
          messageRole: 'assistant',
        };
      }

      // For non-message actions, generate display based on function name and parameters
      const displayTitle = action.result?.name || action.title;
      let displayDescription = action.description;

      // Generate better descriptions for function calls
      if (action.result?.type === 'function_call' && action.result?.name) {
        try {
          switch (action.result.name) {
            case 'get_customer_history': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as GetCustomerHistoryArgs)
                : { senderEmail: '' };
              displayDescription = `Got customer history for ${args.senderEmail}`;
              break;
            }
            case 'search_customer_emails': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as SearchCustomerEmailsArgs)
                : { senderEmail: '', searchQuery: '' };
              displayDescription = `Searched emails from ${args.senderEmail} for "${args.searchQuery}"`;
              break;
            }
            case 'tag_email': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as TagEmailArgs)
                : { emailId: '', tags: [] };
              displayDescription = `Tagged email ${args.emailId} as ${
                args.tags.join(', ') || 'unknown'
              }`;
              break;
            }
            case 'search_knowledge_base': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as SearchKnowledgeBaseArgs)
                : { query: '' };
              displayDescription = `Searched knowledge base for: "${
                args.query || 'unknown query'
              }"`;
              break;
            }
            case 'write_draft': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as WriteDraftArgs)
                : { emailId: 0 };
              displayDescription = `Created draft response for email ${args.emailId}`;
              break;
            }
            case 'read_thread':
              displayDescription = 'Read email thread';
              break;
          }
        } catch (e) {
          console.error('Failed to parse function call arguments:', e);
        }
      }

      // Handle hosted_tool_call types (like file_search_call)
      if (
        action.result?.type === 'hosted_tool_call' &&
        action.result?.name === 'file_search_call'
      ) {
        const providerData = action.result.providerData as FileSearchProviderData;
        const queries = providerData?.queries || [];
        displayDescription = `Searched knowledge base with queries: ${queries.join(', ')}`;
      }

      return {
        icon: getIconForAction(action.type, action.result?.tool_name as string | undefined),
        title: displayTitle,
        description: displayDescription,
        timestamp: new Date(action.timestamp).toLocaleTimeString(),
        status:
          action.status === 'completed'
            ? 'completed'
            : action.status === 'failed'
            ? 'failed'
            : 'pending',
        type: action.type,
      };
    }) || []
  ).filter((action): action is AgentActionProps => action !== null);

  const handleSendMessage = (message: string) => {
    if (!selectedThreadId) return;
    
    void (async () => {
      try {
        await apiClient.post(`/api/threads/${selectedThreadId}/regenerate`, {
          userMessage: message
        });
        // The useAgentActivity hook should automatically refresh with new data
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    })();
  };

  return (
    <AgentPanel
      actions={actions}
      analysis={agentActivity?.analysis}
      draftResponse={agentActivity?.suggested_response}
      onUseAgent={onUseAgent}
      onDemoCustomerResponse={onDemoCustomerResponse}
      onSendMessage={handleSendMessage}
      onDraftClick={onDraftClick}
      isRegeneratingDraft={isRegeneratingDraft}
      isGeneratingDemoResponse={isGeneratingDemoResponse}
    />
  );
}
