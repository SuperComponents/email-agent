import React from 'react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { DotsLoader } from '../atoms/DotsLoader';
import { cn } from '../../lib/utils';

export interface ExpandedAgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  onDraftClick?: (draft: { body: string }) => void;
  workerStatus?: {
    threadId: number;
    status: string;
    isActive: boolean;
  };
}

export const ExpandedAgentPanel = React.forwardRef<HTMLDivElement, ExpandedAgentPanelProps>(
  ({ className, actions, onDraftClick, workerStatus, ...props }, ref) => {
    // Check if agent is currently working using worker status
    const isAgentWorking = workerStatus?.isActive || false;

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
