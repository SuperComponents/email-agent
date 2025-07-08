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
          'flex gap-3 p-3 rounded-lg bg-card/50 border border-border',
          className
        )}
        {...props}
      >
        <Icon
          icon={icon}
          size="sm"
          className={cn(
            'mt-0.5',
            status === 'completed' && 'text-primary',
            status === 'pending' && 'text-secondary-foreground',
            status === 'failed' && 'text-destructive'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium">{title}</h4>
            {timestamp && (
              <time className="text-xs text-secondary-foreground">
                {timestamp}
              </time>
            )}
          </div>
          {description && (
            <p className="text-sm text-secondary-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }
);

AgentAction.displayName = 'AgentAction';