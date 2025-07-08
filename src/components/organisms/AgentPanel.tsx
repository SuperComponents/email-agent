import React from 'react';
import { AgentAction, AgentActionProps } from '../molecules/AgentAction';
import { Separator } from '../atoms/Separator';
import { cn } from '../../lib/utils';

export interface AgentPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: AgentActionProps[];
  analysis?: string;
  draftResponse?: string;
}

export const AgentPanel = React.forwardRef<HTMLDivElement, AgentPanelProps>(
  ({ className, actions, analysis, draftResponse, ...props }, ref) => {
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
          <h3 className="font-semibold mb-4">Agent Activity</h3>
          
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