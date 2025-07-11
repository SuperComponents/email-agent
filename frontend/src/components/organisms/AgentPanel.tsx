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
  ({ className, actions, analysis, draftResponse, onUseAgent, onDemoCustomerResponse, isRegeneratingDraft, isGeneratingDemoResponse, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-full bg-card border-l border-border overflow-y-auto',
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Agent Activity</h3>
          </div>
          
          <div className="space-y-2 mb-6">
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
          
          {actions.length > 0 && (
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-secondary-foreground">
                Tool Calls
              </h4>
              {actions.map((action, index) => (
                <AgentAction key={index} {...action} />
              ))}
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

          {draftResponse && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-secondary-foreground">
                  Draft Response
                </h4>
                <div className="text-sm bg-accent/50 rounded-lg p-3 border border-accent-foreground/20">
                  {draftResponse}
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