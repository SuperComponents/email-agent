import React from 'react';
import { cn } from '../../lib/utils';
import { Logo } from '../atoms';
import { UserMenu } from '../molecules';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export type HeaderProps = React.HTMLAttributes<HTMLElement>;

export const Header = React.forwardRef<HTMLElement, HeaderProps>(({ className, ...props }, ref) => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
  };

  const handleEmailGenerated = () => {
    // Refresh threads when emails are generated
    void queryClient.invalidateQueries({ queryKey: ['threads'] });
  };

  return (
    <header
      ref={ref}
      className={cn(
        'min-h-[60px] max-h-[60px] bg-card border-b border-border px-4 flex items-center justify-between',
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
        onEmailGenerated={handleEmailGenerated}
      />
    </header>
  );
});

Header.displayName = 'Header';
