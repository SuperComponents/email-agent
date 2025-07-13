import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { DotsLoader } from '../atoms/DotsLoader';
import { Modal } from '../atoms/Modal';
import { ExpandedAgentPanel } from './ExpandedAgentPanel';
import { cn } from '../../lib/utils';

export interface AgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  draftResponse?: string;
  currentThreadId?: number;
  workerStatus?: {
    threadId: number;
    status: string;
    isActive: boolean;
  };
  onStartWorker?: () => void;
  isStartingWorker?: boolean;
  onDraftClick?: (draft: { body: string }) => void;
}

export const AgentPanel = React.forwardRef<HTMLDivElement, AgentPanelProps>(
  (
    {
      className,
      actions,
      onDraftClick,
      ...props
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);
    console.log('actions', actions);

    // Check if agent is currently working using worker status
    const isAgentWorking = props.workerStatus?.isActive || false;

    return (
      <div ref={ref} className={cn('h-full bg-card flex flex-col', className)} {...props}>
        <div className="border-b border-border p-4 h-[60px] flex items-center justify-between">
          <h3 className="font-semibold">Activity</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="p-2"
            title="Expand activity"
          >
            <Icon icon={Maximize2} size="sm" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agent Actions */}
          {actions.length > 0 ? (
            <div className="space-y-3">
              {actions.map((action, index) => (
                <AgentAction key={index} {...action} onDraftClick={onDraftClick} />
              ))}
              {/* Show loader when agent is working */}
              {isAgentWorking && (
                <div className="flex justify-center py-3">
                  <DotsLoader text="Working" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-secondary-foreground">
              <p>No agent activity yet.</p>
              <p className="mt-1">Click "Use Agent" to start analyzing this conversation.</p>
            </div>
          )}
        </div>

        {/* Expanded Modal */}
        <Modal
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          title="Agent Activity"
          size="xl"
        >
          <ExpandedAgentPanel actions={actions} onDraftClick={onDraftClick} workerStatus={props.workerStatus} />
        </Modal>
      </div>
    );
  },
);

AgentPanel.displayName = 'AgentPanel';
