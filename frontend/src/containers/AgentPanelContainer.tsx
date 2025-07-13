import { useEffect, useRef } from 'react';
import { useAgentActivity, queryKeys } from '../repo/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../stores/ui-store';
import { AgentPanel } from '../components/organisms';
import { FileSearch, Brain, MessageSquare, Zap, FileText, Users, Search, Tag } from 'lucide-react';
import type { AgentActionProps } from '../components/molecules/AgentAction';
import type { AgentAction } from '../types/api';
import { apiClient } from '../lib/api';

// Types for function call arguments
// interface WriteDraftArgs {
//   emailId: number;
//   threadId: number;
//   messageBody: string;
//   citationFilename?: string;
//   citationScore?: number;
//   citationText?: string;
//   confidence?: number;
// }

interface TagEmailArgs {
  emailId: string;
  tags: string[];
  confidence?: number;
}

// interface GetCustomerHistoryArgs {
//   senderEmail: string;
//   limit?: number;
// }

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
function getIconForAction(action: AgentAction) {
  // Check function_call names first
  if (action.result?.type === 'function_call' && action.result?.name) {
    switch (action.result.name) {
      case 'get_customer_history':
        return Users;
      case 'search_customer_emails':
        return Search;
      case 'tag_email':
        return Tag;
      case 'search_knowledge_base':
        return FileSearch;
      case 'write_draft':
        return FileText;
      case 'read_thread':
        return MessageSquare;
      default:
        return Brain;
    }
  }

  // Check hosted tool calls
  if (action.result?.type === 'hosted_tool_call' && action.result?.name === 'file_search_call') {
    return FileSearch;
  }

  // Database action type icons (fallback)
  switch (action.type) {
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

interface ExtendedAgentActionProps extends AgentActionProps {
  tooltip?: string;
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
   if (agentActivity && agentActivity.actions) {
     const resultsLog = agentActivity.actions
       .map((action, index) => {
         return (
           `\n========== Action ${index} ==========\n` +
           `ID: ${action.id}\n` +
           `Type: ${action.type}\n` +
           `Title: ${action.title}\n` +
           `Status: ${action.status}\n` +
           `Timestamp: ${action.timestamp}\n` +
           `Result: ${action.result ? JSON.stringify(action.result, null, 2) : 'null'}\n`
         );
       })
       .join('\n');
 
     console.log('=== AGENT ACTIVITY RESULTS ===\n' + resultsLog + '\n=== END AGENT ACTIVITY ===');
   }

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

  const actions: ExtendedAgentActionProps[] = (
    actionsReversed?.map((action): ExtendedAgentActionProps | null => {
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
          isFromExplainToolCall: isExplainToolCall,
        };
      }

      // For non-message actions, generate display based on function name and parameters
      const displayTitle = action.result?.name || action.title;
      let displayDescription = action.description;
      let tooltip: string | undefined;

      // Generate better descriptions for function calls
      if (action.result?.type === 'function_call' && action.result?.name) {
        try {
          switch (action.result.name) {
            case 'get_customer_history': {
              displayDescription = `Got customer email history`;
              break;
            }
            case 'search_customer_emails': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as SearchCustomerEmailsArgs)
                : { senderEmail: '', searchQuery: '' };
              displayDescription = `Searched customer emails for "${args.searchQuery}"`;
              break;
            }
            case 'tag_email': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as TagEmailArgs)
                : { emailId: '', tags: [] };
              displayDescription = `Tagged email: ${
                args.tags.join(', ') || 'unknown'
              }`;
              break;
            }
            case 'search_knowledge_base': {
              const args = action.result.arguments
                ? (JSON.parse(action.result.arguments) as SearchKnowledgeBaseArgs)
                : { query: '' };
              displayDescription = `Searched knowledge base for "${args.query}"`;
              tooltip = args.query ? `Query: "${args.query}"` : undefined;
              break;
            }
            case 'write_draft': {
              displayDescription = `Created draft response`;
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
        if (queries.length > 0) {
          const firstQuery = queries[0];
          const additionalCount = queries.length - 1;
          displayDescription = `Searched knowledge base for "${firstQuery}"${additionalCount > 0 ? ` [+${additionalCount}]` : ''}`;
          tooltip = `Queries: ${queries.map(q => `"${q}"`).join(', ')}`;
        } else {
          displayDescription = `Searched knowledge base`;
        }
      }

      return {
        icon: getIconForAction(action),
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
        result: action.result,
        ...(tooltip && { tooltip }),
      };
    }) || []
  ).filter((action): action is ExtendedAgentActionProps => action !== null);

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
