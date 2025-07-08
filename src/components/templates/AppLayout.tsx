import React from 'react';
import { cn } from '../../lib/utils';

export interface AppLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  main?: React.ReactNode;
  panel?: React.ReactNode;
}

export const AppLayout = React.forwardRef<HTMLDivElement, AppLayoutProps>(
  ({ className, header, sidebar, main, panel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('h-screen flex flex-col bg-background', className)}
        {...props}
      >
        {header && <div className="flex-shrink-0">{header}</div>}
        
        <div className="flex-1 flex overflow-hidden">
          {sidebar && (
            <aside className="w-80 flex-shrink-0 border-r border-border overflow-hidden">
              {sidebar}
            </aside>
          )}
          
          {main && (
            <main className="flex-1 flex flex-col overflow-hidden">
              {main}
            </main>
          )}
          
          {panel && (
            <aside className="w-80 flex-shrink-0 border-l border-border overflow-hidden">
              {panel}
            </aside>
          )}
        </div>
      </div>
    );
  }
);

AppLayout.displayName = 'AppLayout';