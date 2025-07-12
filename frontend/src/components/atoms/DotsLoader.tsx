import React from 'react';
import { cn } from '../../lib/utils';

export interface DotsLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export const DotsLoader = React.forwardRef<HTMLDivElement, DotsLoaderProps>(
  ({ className, text = 'Working', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 text-sm text-secondary-foreground', className)}
        {...props}
      >
        <span>{text}</span>
        <div className="flex gap-1">
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '0ms', animationDuration: '800ms' }}
          />
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '200ms', animationDuration: '800ms' }}
          />
          <div 
            className="w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{ animationDelay: '400ms', animationDuration: '800ms' }}
          />
        </div>
      </div>
    );
  }
);

DotsLoader.displayName = 'DotsLoader';