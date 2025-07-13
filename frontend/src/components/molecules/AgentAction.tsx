import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface AgentActionProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'pending' | 'completed' | 'failed';
  isMessage?: boolean;
  messageRole?: 'user' | 'assistant';
//   result?: {
//     tool_name?: string;
//     urgency_change?: string;
//     confidence?: number;
//     sentiment?: string;
//     escalation_recommended?: boolean;
//     suggested_priority?: string;
//     rag_sources_used?: number;
//     draft_subject?: string;
//     draft_body_preview?: string;
//     category_change?: string;
//     action_reason?: string;
//     [key: string]: unknown;
//   };
  type?: string; // Database action type like 'thread_status_changed'
  onDraftClick?: (draft: { body: string }) => void;
}

export const AgentAction = React.forwardRef<HTMLDivElement, AgentActionProps>(
  (
    {
      className,
      icon,
      title,
      description,
      timestamp,
      status = 'completed',
      isMessage,
      messageRole,
      //result,
      type,
      onDraftClick,
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
            <h4 className="text-xs font-medium leading-tight">{title}</h4>
            {timestamp && (
              <time className="text-xs text-secondary-foreground flex-shrink-0">
                {timestamp}
              </time>
            )}
          </div>

            <div className="mt-1 overflow-hidden">
              <span className="text-sm font-medium text-foreground break-words">
                {description}
              </span>
            </div>

        </div>
      </div>
    );
  }
);

AgentAction.displayName = 'AgentAction';