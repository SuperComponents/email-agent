import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../atoms/Button';
import { useAuth } from '../../hooks/useAuth';

export type HeaderProps = React.HTMLAttributes<HTMLElement>;

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
    ({ className, ...props }, ref) => {
        const { user, logout } = useAuth();
        
        const handleLogout = async () => {
            await logout();
        };
        
        return (
            <header
                ref={ref}
                className={cn(
                    'h-16 bg-card border-b border-border px-4 flex items-center justify-between',
                    className
                )}
                {...props}
            >
                <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold">ProResponse AI</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    {user && (
                        <span className="text-sm text-secondary-foreground">
                            Welcome, {user.name}
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void handleLogout()}
                    >
                        Logout
                    </Button>
                </div>
            </header>
        );
    }
);

Header.displayName = 'Header';