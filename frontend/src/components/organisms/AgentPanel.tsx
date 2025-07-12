import React, { useState } from 'react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { Button } from '../atoms/Button';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  onSendMessage?: (message: string) => void;
}

export const AgentPanel = React.forwardRef<HTMLDivElement, AgentPanelProps>(
  ({ className, actions, onSendMessage, ...props }, ref) => {
    const [message, setMessage] = useState('');
    
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
      <div
        ref={ref}
        className={cn(
          'h-full bg-card border-l border-border flex flex-col',
          className
        )}
        {...props}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-semibold mb-4">Agent Activity</h3>
          
          {actions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-secondary-foreground">
                Tool Calls
              </h4>
              {actions.map((action, index) => (
                <AgentAction key={index} {...action} />
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 min-h-[80px] p-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="self-end"
              size="sm"
            >
              <Send size={16} className="mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

AgentPanel.displayName = 'AgentPanel';