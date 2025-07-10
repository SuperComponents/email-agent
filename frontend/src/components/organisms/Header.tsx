import React from 'react';
import { cn } from '../../lib/utils';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> { }

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
    ({ className, ...props }, ref) => {
        return (
            <header
                ref={ref}
                className={cn(
                    'h-16 bg-card border-b border-border px-4 flex items-center justify-between',
                    className
                )}
                {...props}
            >
                {/* UserButton disabled for testing */}
            </header>
        );
    }
);

Header.displayName = 'Header';