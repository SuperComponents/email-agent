import React from 'react';
import { Badge } from '../atoms/Badge';
import { cn } from '../../lib/utils';

export interface ThreadPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  title: string;
  snippet: string;
  author: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  timestamp: string;
  isActive?: boolean;
  isUnread?: boolean;
  workerActive?: boolean;
}

export const ThreadPreview = React.forwardRef<HTMLDivElement, ThreadPreviewProps>(
  (
    {
      className,
      title,
      snippet,
      timestamp,
      isActive,
      isUnread,
      workerActive = false,

      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-4 border-b border-border cursor-pointer transition-colors',
          'hover:bg-accent/50',
          isActive && 'bg-accent',
          className,
        )}
        {...props}
      >
        <div className="flex gap-3">
          {/* Unread indicator dot */}
          <div className="flex items-start pt-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                isUnread ? 'bg-primary' : 'bg-transparent',
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2 mb-1 align-center">
              <h3
                className={cn(
                  'text-sm truncate',
                  isUnread && 'text-foreground font-semibold',
                  !isUnread && 'text-secondary-foreground font-normal',
                )}
              >
                {title}
              </h3>
              <div className="flex items-center gap-2 h-full h-min-full">
                {workerActive && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:0ms]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:200ms]"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse [animation-delay:400ms]"></div>
                  </div>
                )}
                <time
                  className={cn(
                    'text-xs my-auto text-nowrap',
                    isUnread ? 'text-foreground font-medium' : 'text-secondary-foreground',
                  )}
                >
                  {timestamp}
                </time>
              </div>
            </div>
            <p
              className={cn(
                'text-sm truncate mb-2',
                isUnread ? 'text-foreground font-medium' : 'text-secondary-foreground',
              )}
            >
              {snippet}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

ThreadPreview.displayName = 'ThreadPreview';
