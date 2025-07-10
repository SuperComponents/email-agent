import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { UserButton } from '@stackframe/react';
import { Mail, FileText } from 'lucide-react';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> { }

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
    ({ className, ...props }, ref) => {
        const location = useLocation();
        
        return (
            <header
                ref={ref}
                className={cn(
                    'h-16 bg-card border-b border-border px-4 flex items-center justify-between',
                    className
                )}
                {...props}
            >
                <div className="flex items-center gap-6">
                    <nav className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                location.pathname === '/' || location.pathname.startsWith('/thread')
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <Mail size={16} />
                            Inbox
                        </Link>
                        <Link
                            to="/knowledge-base"
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                                location.pathname === '/knowledge-base'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <FileText size={16} />
                            Knowledge Base
                        </Link>
                    </nav>
                </div>
                <UserButton />
            </header>
        );
    }
);

Header.displayName = 'Header';