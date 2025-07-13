import { useEffect, useRef } from 'react';
import { useAgentActivity, useWorkerStatus, useStartWorker, queryKeys } from '../repo/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../stores/ui-store';
import { AgentPanel } from '../components/organisms';
import {
  FileSearch,
  Brain,
  MessageSquare,
  AlertTriangle,
  Zap,
  FileText,
  Users,
  Send,
  Sparkle,
  Folder,
  Pen,
} from 'lucide-react';
import type { AgentActionProps } from '../components/molecules/AgentAction';

// Helper function to get appropriate icon for action types
function getIconForAction(actionType: string, toolName?: string, description?: string) {
  // Special handling for response sent to customer
  if (description?.includes('Response sent to customer')) return Send;
  if (description?.includes('Draft response generated')) return Sparkle;

  // Tool-specific icons
  if (toolName === 'update_thread_urgency') return Zap;
  if (toolName === 'update_thread_category') return Folder;
  if (toolName === 'user_action_needed') return AlertTriangle;
  if (toolName === 'compose-draft' || toolName === 'compose_draft') return Sparkle;
  if (toolName === 'summarize_useful_context') return Pen;
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

export function AgentPanelContainer({ onDraftClick }: AgentPanelContainerProps) {
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const isAgentPanelOpen = useUIStore(state => state.isAgentPanelOpen);
  const queryClient = useQueryClient();
  const seenWriteDraftIds = useRef<Set<string>>(new Set());

  const { data: agentActivity } = useAgentActivity(selectedThreadId || '');
  const { data: workerStatus } = useWorkerStatus(selectedThreadId ? parseInt(selectedThreadId) : 0);
  const startWorkerMutation = useStartWorker();

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

  console.log('actionsReversed', actionsReversed);
  const actions: AgentActionProps[] = (
    actionsReversed?.map((action): AgentActionProps | null => {
      // Skip function_call_result items (legacy check)
      if (action.result?.type === 'function_call_result') {
        return null;
      }

      console.log('action', action);

      // Check if this is a message type (legacy check)
      const isMessage = action.result?.type === 'message';
      const isExplainToolCall = action.result?.name === 'explain_next_tool_call';

      // Handle legacy message types (for backwards compatibility)
      if (isMessage) {
        const messageContent = action.result?.content?.[0]?.text || '';
        const messageRole = action.result?.role as 'user' | 'assistant' | undefined;

        return {
          icon: MessageSquare,
          title: action.title,
          description: messageContent,
          timestamp: action.timestamp,
          status: action.status as 'completed' | 'pending' | 'failed',
          isMessage: true,
          messageRole: messageRole || 'assistant',
        };
      }

      if (isExplainToolCall) {
        let messageContent = '';
        try {
          const argumentsText = action.result?.arguments;
          if (argumentsText) {
            const parsed = JSON.parse(argumentsText) as { explanation?: string };
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
          timestamp: action.timestamp,
          status: action.status as 'completed' | 'pending' | 'failed',
          isMessage: true,
          messageRole: 'assistant',
        };
      }

      // Use the new enhanced backend API data structure
      return {
        icon: getIconForAction(action.type, action.result?.tool_name, action.description),
        title: action.title,
        description: action.description,
        timestamp: action.timestamp,
        status: action.status as 'completed' | 'pending' | 'failed',
        result: action.result,
        type: action.type,
      };
    }) || []
  ).filter((action): action is AgentActionProps => action !== null);

  const handleStartWorker = () => {
    if (!selectedThreadId) return;
    startWorkerMutation.mutate(parseInt(selectedThreadId));
  };

  console.log('actions22', actions);

  return (
    <AgentPanel
      actions={actions}
      draftResponse={agentActivity?.suggested_response}
      currentThreadId={selectedThreadId ? parseInt(selectedThreadId) : undefined}
      workerStatus={workerStatus}
      onStartWorker={handleStartWorker}
      isStartingWorker={startWorkerMutation.isPending}
      onDraftClick={onDraftClick}
    />
  );
}
