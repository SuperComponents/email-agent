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
}

export const AgentAction = React.forwardRef<HTMLDivElement, AgentActionProps>(
  ({ className, icon, title, description, timestamp, status = 'completed', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-2 p-2 rounded-md bg-accent/30 border-l-2',
          status === 'completed' && 'border-l-primary/50',
          status === 'pending' && 'border-l-secondary',
          status === 'failed' && 'border-l-destructive/50',
          className
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
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-medium leading-tight">{title}</h4>
            {timestamp && (
              <time className="text-xs text-secondary-foreground flex-shrink-0">
                {timestamp}
              </time>
            )}
          </div>
          {description && (
            <p className="text-xs text-secondary-foreground mt-0.5 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

AgentAction.displayName = 'AgentAction';