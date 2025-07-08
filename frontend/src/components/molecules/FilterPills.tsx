import React from 'react';
import { Button } from '../atoms/Button';
import { cn } from '../../lib/utils';

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
        className={cn('flex flex-wrap gap-2', className)}
        {...props}
      >
        {options.map((option) => (
          <Button
            key={option.id}
            variant={value === option.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onValueChange?.(option.id)}
            className="rounded-full"
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-70">
                {option.count}
              </span>
            )}
          </Button>
        ))}
      </div>
    );
  }
);

FilterPills.displayName = 'FilterPills';