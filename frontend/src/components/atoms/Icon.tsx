import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
}

export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ className, icon: IconComponent, size = 'md', ...props }, ref) => {
    const sizeMap = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    return (
      <span
        ref={ref}
        className={cn('inline-flex shrink-0', className)}
        {...props}
      >
        <IconComponent size={sizeMap[size]} />
      </span>
    );
  }
);

Icon.displayName = 'Icon';