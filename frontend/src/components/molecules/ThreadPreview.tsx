import React from "react";
import { Avatar } from "../atoms/Avatar";
import { Badge } from "../atoms/Badge";
import { cn } from "../../lib/utils";

export interface ThreadPreviewProps
  extends React.HTMLAttributes<HTMLDivElement> {
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
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
}

export const ThreadPreview = React.forwardRef<
  HTMLDivElement,
  ThreadPreviewProps
>(
  (
    {
      className,
      title,
      snippet,
      author,
      timestamp,
      isActive,
      isUnread,
      badges = [],
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2 border-b border-border cursor-pointer transition-colors",
          "hover:bg-accent/50",
          isActive && "bg-accent",
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={cn(
                  "font-semibold truncate",
                  isUnread && "text-foreground",
                  !isUnread && "text-secondary-foreground"
                )}
              >
                {title}
              </h3>
              <time className="text-xs text-secondary-foreground flex-shrink-0">
                {timestamp}
              </time>
            </div>
            <p className="text-sm text-secondary-foreground truncate mb-2">
              {snippet}
            </p>
            {badges.length > 0 && (
              <div className="flex gap-1.5">
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ThreadPreview.displayName = "ThreadPreview";
