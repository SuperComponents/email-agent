import React from "react";
import { Button } from "../atoms/Button";
import { cn } from "../../lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterPillsProps extends React.HTMLAttributes<HTMLDivElement> {
  options: FilterOption[];
  value?: string;
  onValueChange?: (value: string) => void;
}

export const FilterPills = React.forwardRef<HTMLDivElement, FilterPillsProps>(
  ({ className, options, value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex no-wrap overflow-x-auto gap-2 no-scrollbar",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <Button
            key={option.id}
            variant={value === option.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onValueChange?.(option.id)}
            className={cn(
              "rounded-full h-7 px-3 text-xs",
              value === option.id
                ? "bg-primary/10 text-primary border-primary/20"
                : "hover:bg-secondary/50"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1 text-xs opacity-70">{option.count}</span>
            )}
          </Button>
        ))}
      </div>
    );
  }
);

FilterPills.displayName = "FilterPills";
