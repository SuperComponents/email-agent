import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Icon } from "../atoms/Icon";
import { cn } from "../../lib/utils";

export interface EmailHeaderProps {
  to?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  onToChange?: (value: string) => void;
  onCcChange?: (value: string) => void;
  onBccChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const EmailHeader = React.forwardRef<HTMLDivElement, EmailHeaderProps>(
  (
    {
      to = "",
      from = "",
      cc = "",
      bcc = "",
      onToChange,
      onCcChange,
      onBccChange,
      disabled,
      className,
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div ref={ref} className={cn("border-b border-border/50", className)}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between py-2 px-3 hover:bg-accent/20 text-sm text-secondary-foreground"
        >
          <div className="flex items-center gap-2">
            <Icon icon={isExpanded ? ChevronDown : ChevronRight} size="sm" />
            {!isExpanded && <span>To: {to || "recipient@example.com"}</span>}
            {isExpanded && <span></span>}
          </div>
          <span className="text-xs">
            {isExpanded ? "Click to collapse" : "Click to expand"}
          </span>
        </button>

        {isExpanded && (
          <div className="px-3 pb-2 space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-secondary-foreground w-8">
                To:
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => onToChange?.(e.target.value)}
                placeholder="recipient@example.com"
                disabled={disabled}
                className="flex-1 bg-transparent text-sm py-1 px-2 focus:outline-none focus:bg-accent/10 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-secondary-foreground w-8">
                From:
              </label>
              <span className="flex-1 text-sm py-1 px-2 text-foreground">
                {from || 'support@company.com'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-secondary-foreground w-8">
                CC:
              </label>
              <input
                type="email"
                value={cc}
                onChange={(e) => onCcChange?.(e.target.value)}
                placeholder="cc@example.com"
                disabled={disabled}
                className="flex-1 bg-transparent text-sm py-1 px-2 focus:outline-none focus:bg-accent/10 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-secondary-foreground w-8">
                BCC:
              </label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => onBccChange?.(e.target.value)}
                placeholder="bcc@example.com"
                disabled={disabled}
                className="flex-1 bg-transparent text-sm py-1 px-2 focus:outline-none focus:bg-accent/10 rounded"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

EmailHeader.displayName = "EmailHeader";
