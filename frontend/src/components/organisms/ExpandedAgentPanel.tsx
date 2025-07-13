import React from 'react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { DotsLoader } from '../atoms/DotsLoader';
import { cn } from '../../lib/utils';

export interface ExpandedAgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  onDraftClick?: (draft: { body: string }) => void;
}

export const ExpandedAgentPanel = React.forwardRef<HTMLDivElement, ExpandedAgentPanelProps>(
  ({ className, actions, onDraftClick, ...props }, ref) => {
    // Check if agent is currently working:
    // 1. There's at least one user message
    // 2. The last action is NOT an assistant message (unless it's from explain_next_tool_call)
    const hasUserMessage = actions.some(action => action.isMessage && action.messageRole === 'user');
    const lastAction = actions[actions.length - 1];
    const lastActionIsAssistantMessage = lastAction?.isMessage && lastAction?.messageRole === 'assistant';
    const lastActionIsExplainToolCall = lastAction?.isFromExplainToolCall === true;
    const isAgentWorking = hasUserMessage && (!lastActionIsAssistantMessage || lastActionIsExplainToolCall);

    return (
      <div ref={ref} className={cn('p-8', className)} {...props}>
        {/* Agent Actions */}
        {actions.length > 0 ? (
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={index} className="transform origin-left">
                <AgentAction {...action} onDraftClick={onDraftClick} />
              </div>
            ))}
            {/* Show loader when agent is working */}
            {isAgentWorking && (
              <div className="flex justify-center py-6">
                <div className="transform scale-125">
                  <DotsLoader text="Working" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-lg text-secondary-foreground">
            <p>No agent activity yet.</p>
            <p className="mt-3">Click "Use Agent" to start analyzing this conversation.</p>
          </div>
        )}
      </div>
    );
  },
);

ExpandedAgentPanel.displayName = 'ExpandedAgentPanel';
