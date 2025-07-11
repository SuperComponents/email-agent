import React from 'react';
import { Sparkles, UserPlus } from 'lucide-react';
import { AgentAction, type AgentActionProps } from '../molecules/AgentAction';
import { Separator } from '../atoms/Separator';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface AgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  analysis?: string;
  draftResponse?: string;
  onUseAgent?: () => void;
  onDemoCustomerResponse?: () => void;
  isRegeneratingDraft?: boolean;
  isGeneratingDemoResponse?: boolean;
}

export const AgentPanel = React.forwardRef<HTMLDivElement, AgentPanelProps>(
  ({ className, actions, analysis, onUseAgent, onDemoCustomerResponse, isRegeneratingDraft, isGeneratingDemoResponse, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-full bg-card overflow-y-auto',
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Agent Activity</h3>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="text-xs text-secondary-foreground leading-relaxed">
              Use the agent to analyze this conversation and generate a helpful response. The agent will search your knowledge base and provide citations.
            </div>
            <div className="space-y-2">
              <Button
                onClick={onUseAgent}
                size="sm"
                variant="secondary"
                className="w-full gap-2"
                disabled={isRegeneratingDraft}
              >
                <Icon 
                  icon={Sparkles} 
                  size="sm" 
                  className={isRegeneratingDraft ? 'animate-pulse' : ''}
                />
                <span>{isRegeneratingDraft ? 'Generating...' : 'Use Agent'}</span>
              </Button>
              <Button
                onClick={onDemoCustomerResponse}
                size="sm"
                variant="ghost"
                className="w-full gap-2"
                disabled={isGeneratingDemoResponse}
              >
                <Icon 
                  icon={UserPlus} 
                  size="sm" 
                  className={isGeneratingDemoResponse ? 'animate-pulse' : ''}
                />
                <span>{isGeneratingDemoResponse ? 'Generating...' : 'Demo Customer Response'}</span>
              </Button>
            </div>
          </div>
          
          {actions.length > 0 ? (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-secondary-foreground">
                Tool Calls
              </h4>
              {actions.map((action, index) => (
                <AgentAction key={index} {...action} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-secondary-foreground">
              <p>No agent activity yet.</p>
              <p className="mt-1">Click "Use Agent" to start analyzing this conversation.</p>
            </div>
          )}

          {analysis && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-secondary-foreground">
                  Analysis
                </h4>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  {analysis}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }
);

AgentPanel.displayName = 'AgentPanel';