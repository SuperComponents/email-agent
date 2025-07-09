import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export const SearchInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Icon
          icon={Search}
          size="sm"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground"
        />
        <Input
          ref={ref}
          type="search"
          className={cn('pl-9', className)}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';