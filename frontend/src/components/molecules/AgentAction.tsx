import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { Tooltip } from '../atoms/Tooltip';
import { cn } from '../../lib/utils';

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  console.log('timestamp', timestamp);
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
  result?: {
    tool_name?: string;
    urgency_change?: string;
    confidence?: number;
    sentiment?: string;
    escalation_recommended?: boolean;
    suggested_priority?: string;
    rag_sources_used?: number;
    draft_subject?: string;
    draft_body_preview?: string;
    category_change?: string;
    action_reason?: string;
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
      onDraftClick,
      ...props
    },
    ref,
  ) => {
    // Check if this is a finalized draft action (not just any draft action)
    const isFinalizedDraft = type === 'draft_created' && result?.tool_name === 'compose-draft';

    if (description?.includes('Email analyzed with enhanced AI')) {
      description = 'Received email from customer';
    }
    if (description?.includes('Response sent to customer')) {
      description = 'Response sent to customer';
    }
    if (description?.includes('Agent action: finalize_draft')) {
      return;
    }
    const handleDraftClick = () => {
      if (isFinalizedDraft && onDraftClick && result) {
        const toolOutput = result.tool_output as { result?: { body?: string } };
        console.log('Draft click - result:', result);
        console.log('Draft click - toolOutput:', toolOutput);
        console.log('Draft click - body:', toolOutput?.result?.body);
        onDraftClick({
          body: toolOutput?.result?.body || (result.draft_body_preview as string) || '',
        });
      }
    };
    console.log('result', result, description);

    // Message-style display for chat messages
    if (isMessage) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex gap-2 mb-3',
            messageRole === 'user' ? 'justify-end' : 'justify-start',
            className,
          )}
          {...props}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2',
              messageRole === 'user'
                ? 'bg-primary text-primary-foreground ml-8'
                : 'bg-accent/50 border border-accent-foreground/20 mr-8',
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{description}</p>
            {timestamp && (
              <time
                className={cn(
                  'text-xs mt-1 block',
                  messageRole === 'user'
                    ? 'text-primary-foreground/70'
                    : 'text-secondary-foreground',
                )}
              >
                {formatTimeAgo(timestamp)}
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
          isFinalizedDraft && onDraftClick && 'cursor-pointer hover:bg-accent/50 transition-colors',
          className,
        )}
        onClick={isFinalizedDraft ? handleDraftClick : undefined}
        {...props}
      >
        <Icon
          icon={icon}
          size="sm"
          className={cn(
            'mt-0.5 flex-shrink-0',
            status === 'completed' && 'text-primary',
            status === 'pending' && 'text-secondary-foreground animate-pulse',
            status === 'failed' && 'text-destructive',
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

          {/* Special handling for urgency update events */}
          {type === 'thread_status_changed' && result?.tool_name === 'update_thread_urgency' && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                Urgency:{' '}
                {(result?.tool_output as { args?: { urgency?: string }; new_urgency?: string })
                  ?.args?.urgency ||
                  result?.suggested_priority ||
                  (result?.tool_output as { new_urgency?: string })?.new_urgency ||
                  'unknown'}
              </span>
            </div>
          )}

          {/* Special handling for user action needed events */}
          {type === 'thread_assigned' && result?.tool_name === 'user_action_needed' && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                {result?.action_reason ||
                  (result?.tool_output as { reason?: string; args?: { reason?: string } })
                    ?.reason ||
                  (result?.tool_output as { args?: { reason?: string } })?.args?.reason ||
                  'User action required'}
              </span>

              {(() => {
                console.log('result', result);
                const toolOutput = result?.tool_output as {
                  args?: { suggested_actions?: string[] };
                };
                const suggestedActions = toolOutput?.args?.suggested_actions;

                if (
                  suggestedActions &&
                  Array.isArray(suggestedActions) &&
                  suggestedActions.length > 0
                ) {
                  return (
                    <div className="mt-2">
                      <div className="text-xs text-secondary-foreground mb-1 font-medium">
                        Suggested actions:
                      </div>
                      <ul className="space-y-1">
                        {suggestedActions.slice(0, 4).map((action, index) => (
                          <li
                            key={index}
                            className="text-xs text-foreground/80 flex items-start gap-1"
                          >
                            <span className="text-primary font-bold text-[10px] mt-0.5">▸</span>
                            <span className="break-words leading-tight">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Special handling for category update events */}
          {type === 'thread_status_changed' && result?.tool_name === 'update_thread_category' && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                Category:{' '}
                {(result?.tool_output as { args?: { category?: string }; new_category?: string })
                  ?.args?.category ||
                  (result?.tool_output as { new_category?: string })?.new_category ||
                  'unknown'}
              </span>
            </div>
          )}

          {/* Special handling for summarize context events */}
          {type === 'email_read' && result?.tool_name === 'summarize_useful_context' && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                {result?.context_summary ||
                  (result?.tool_output as { summary?: string; args?: { summary?: string } })
                    ?.summary ||
                  (result?.tool_output as { args?: { summary?: string } })?.args?.summary ||
                  'Context analyzed'}
              </span>
            </div>
          )}

          {/* Special handling for knowledge base search events */}
          {result?.tool_name === 'search-knowledge-base' && (
            <div className="mt-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground break-words">
                  Searched and found{' '}
                  {result?.rag_sources_used ||
                    (
                      result?.tool_output as {
                        result?: Array<{ text?: string; score?: number; filename?: string }>;
                      }
                    )?.result?.length ||
                    (result?.tool_output as { length?: number })?.length ||
                    0}{' '}
                  related documents in the knowledge base
                </span>
                {(() => {
                  const toolOutput = result?.tool_output as {
                    result?: Array<{ text?: string; score?: number; filename?: string }>;
                  };
                  const topResult = toolOutput?.result?.[0];

                  if (topResult && topResult.text) {
                    // Format filename as a clean path without extension
                    const cleanFilename = topResult.filename
                      ? topResult.filename
                          .replace(/\.[^/.]+$/, '')
                          .replace(/[_-]/g, '/')
                          .toLowerCase()
                      : 'knowledge-base';

                    const tooltipContent = `[📄 ${cleanFilename}](javascript:void(0))

${topResult.text}`;

                    return (
                      <Tooltip content={tooltipContent} side="left" markdown={true}>
                        <Icon
                          icon={Search}
                          size="sm"
                          className="text-primary hover:text-primary/80 cursor-help flex-shrink-0"
                        />
                      </Tooltip>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/* Special handling for finalized draft actions */}
          {isFinalizedDraft && (
            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                Draft response generated
              </span>
              {(() => {
                const toolOutput = result?.tool_output as { result?: { body?: string } };
                const body = toolOutput?.result?.body || result?.draft_body_preview;

                return (
                  body && (
                    <div className="text-xs text-secondary-foreground mt-1 line-clamp-2 break-words">
                      {body}
                    </div>
                  )
                );
              })()}
              <div className="text-xs text-primary mt-2 flex items-center gap-1">
                <span>Click to use this draft →</span>
              </div>
            </div>
          )}

          {/* Fallback to description for other events */}
          {!(type === 'thread_status_changed' && result?.tool_name === 'update_thread_urgency') &&
            !(type === 'thread_assigned' && result?.tool_name === 'user_action_needed') &&
            !(type === 'thread_status_changed' && result?.tool_name === 'update_thread_category') &&
            !(type === 'email_read' && result?.tool_name === 'summarize_useful_context') &&
            !(result?.tool_name === 'search-knowledge-base') &&
            !isFinalizedDraft &&
            description && (
              <p className="text-sm text-foreground font-medium leading-tight mt-1 break-words">
                {description}
              </p>
            )}
        </div>
      </div>
    );
  },
);

AgentAction.displayName = 'AgentAction';
