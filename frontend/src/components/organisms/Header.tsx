import React from 'react';
import { cn } from '../../lib/utils';
import { Logo } from '../atoms';
import { UserMenu } from '../molecules';
import { useAuth } from '../../hooks/useAuth';

export type HeaderProps = React.HTMLAttributes<HTMLElement>;

export const Header = React.forwardRef<HTMLElement, HeaderProps>(({ className, ...props }, ref) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      ref={ref}
      className={cn(
        'h-16 bg-card border-b border-border px-4 flex items-center justify-between',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <span className="text-foreground text-xl italic">ProResponse AI</span>
      </div>

      <UserMenu
        userName={user?.name || 'Support Agent'}
        userEmail={user?.email || 'agent@company.com'}
        onLogout={() => void handleLogout()}
      />
    </header>
  );
});

Header.displayName = 'Header';
