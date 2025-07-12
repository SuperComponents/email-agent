import React, { useState } from 'react';
import { Send, Play } from 'lucide-react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { DotsLoader } from '../atoms/DotsLoader';
import { cn } from '../../lib/utils';

export interface AgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  draftResponse?: string;
  onSendMessage?: (message: string) => void;
  currentThreadId?: number;
  workerStatus?: {
    threadId: number;
    status: string;
    isActive: boolean;
  };
  onStartWorker?: () => void;
  isStartingWorker?: boolean;
}

export const AgentPanel = React.forwardRef<HTMLDivElement, AgentPanelProps>(
  (
    {
      className,
      actions,
      onSendMessage,
      currentThreadId,
      workerStatus,
      onStartWorker,
      isStartingWorker,
      ...props
    },
    ref,
  ) => {
    const [message, setMessage] = useState('');
    console.log('actions', actions);

    // Check if agent is currently working (has any pending actions OR worker is running)
    const isAgentWorking =
      actions.some(action => action.status === 'pending') || workerStatus?.status === 'running';

    // Get status color based on worker status
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'running':
          return 'bg-green-500';
        case 'stopped':
          return 'bg-gray-500';
        case 'starting':
          return 'bg-yellow-500';
        case 'stopping':
          return 'bg-orange-500';
        case 'not_found':
          return 'bg-red-500';
        default:
          return 'bg-gray-400';
      }
    };

    const handleSend = () => {
      if (message.trim() && onSendMessage) {
        onSendMessage(message.trim());
        setMessage('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div ref={ref} className={cn('h-full bg-card flex flex-col', className)} {...props}>
        <div className="border-b border-border p-4 h-[60px]">
          <h3 className="font-semibold">Activity</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agent Actions */}
          {actions.length > 0 ? (
            <div className="space-y-3">
              {actions.map((action, index) => (
                <AgentAction key={index} {...action} />
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

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 min-h-[80px] p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
            <Button onClick={handleSend} disabled={!message.trim()} className="self-end" size="sm">
              <Icon icon={Send} size="sm" className="mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

AgentPanel.displayName = 'AgentPanel';
