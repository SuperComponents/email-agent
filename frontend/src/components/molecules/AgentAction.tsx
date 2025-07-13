import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);

  // If timestamp is invalid, return the original timestamp
  if (isNaN(time.getTime())) {
    return timestamp;
  }

  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  // Handle negative differences (future timestamps)
  if (diffInSeconds < 0) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export interface AgentActionProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'pending' | 'completed' | 'failed';
  isMessage?: boolean;
  messageRole?: 'user' | 'assistant';
  isFromExplainToolCall?: boolean; // Track if this message came from explain_next_tool_call
  result?: {
    tool_name?: string;
    urgency_change?: string;
    confidence?: number | null;
    sentiment?: string | null;
    escalation_recommended?: boolean;
    suggested_priority?: string | null;
    rag_sources_used?: number;
    draft_subject?: string;
    draft_body_preview?: string;
    category_change?: string;
    action_reason?: string;
    context_summary?: string;
    tool_output?: unknown;
    [key: string]: unknown;
  };
  type?: string; // Database action type like 'thread_status_changed'
  onDraftClick?: (draft: { body: string }) => void;
}

export const AgentAction = React.forwardRef<HTMLDivElement, AgentActionProps>(
  (
    {
      className,
      icon,
      description,
      timestamp,
      status = 'completed',
      isMessage,
      messageRole,
      result,
      type,
      ...props
    },
    ref,
  ) => {
    // Check if this is a finalized draft action (not just any draft action)
    // const isFinalizedDraft = type === 'draft_created' && result?.tool_name === 'compose-draft';

    if (description?.includes('Email analyzed with enhanced AI')) {
      description = 'Received email from customer';
    }
    if (description?.includes('Response sent to customer')) {
      description = 'Response sent to customer';
    }
    if (description?.includes('Agent action: finalize_draft')) {
      return;
    }
//     const handleDraftClick = () => {
//       if (isFinalizedDraft && onDraftClick && result) {
//         const toolOutput = result.tool_output as { result?: { body?: string } };
//         console.log('Draft click - result:', result);
//         console.log('Draft click - toolOutput:', toolOutput);
//         console.log('Draft click - body:', toolOutput?.result?.body);
//         onDraftClick({
//           body: toolOutput?.result?.body || (result.draft_body_preview as string) || '',
//         });
//       }
//     };
//    console.log('result', result, description);

    // Message-style display for chat messages
    if (isMessage) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex gap-2 mb-3',
            messageRole === 'user' ? 'justify-end' : 'justify-start',
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              messageRole === 'user' 
                ? 'bg-primary text-primary-foreground ml-8' 
                : 'bg-accent/50 border border-accent-foreground/20 mr-8'
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{description}</p>
            {timestamp && (
              <time className={cn(
                "text-xs mt-1 block",
                messageRole === 'user' ? 'text-primary-foreground/70' : 'text-secondary-foreground'
              )}>
                {timestamp}
              </time>
            )}
          </div>
        </div>
      );
    }

    // Default display for non-message actions
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-2 p-2 rounded-md bg-accent/30 border-l-2 w-full overflow-hidden',
          status === 'completed' && 'border-l-primary/50',
          status === 'pending' && 'border-l-secondary',
          status === 'failed' && 'border-l-destructive/50',
          className,
        )}
        {...props}
      >
        <Icon
          icon={icon}
          size="sm"
          className={cn(
            'mt-0.5 flex-shrink-0',
            status === 'completed' && 'text-primary',
            status === 'pending' && 'text-secondary-foreground animate-pulse',
            status === 'failed' && 'text-destructive'
          )}
        />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            {timestamp && (
              <time className="text-xs text-secondary-foreground flex-shrink-0">
                {formatTimeAgo(timestamp)}
              </time>
            )}
          </div>

          <div className="mt-1 overflow-hidden">
            <span className="text-sm font-medium text-foreground break-words">
              {description}
            </span>
          </div>

          {/* Special handling for category update events */}
          {type === 'thread_status_changed' && result?.tool_name === 'update_thread_category' && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                Category: {(result?.tool_output as { args?: { category?: string }; new_category?: string })?.args?.category || 'unknown'}
              </span>
            </div>
          )}

          {/* Special handling for urgency changes */}
          {result?.urgency_change && (
            <div className="mt-2">
              <span className="text-xs font-medium text-destructive">
                Urgency: {result.urgency_change}
              </span>
            </div>
          )}

          {/* User action needed indicator */}
          {type === 'user_action_needed' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-medium text-orange-600">
                Requires manual action
              </span>
            </div>
          )}


          {/* Draft preview for composed drafts */}
          {result?.draft_body_preview && (
            <div className="mt-2 p-2 bg-accent/50 rounded text-xs text-secondary-foreground line-clamp-2">
              {result.draft_body_preview}
            </div>
          )}

          {/* Sources used indicator */}
          {result?.rag_sources_used !== undefined && result.rag_sources_used > 0 && (
            <div className="mt-2 text-xs text-secondary-foreground">
              Used {result.rag_sources_used} knowledge base sources
            </div>
          )}
        </div>
      </div>
    );
  }
);

AgentAction.displayName = 'AgentAction';