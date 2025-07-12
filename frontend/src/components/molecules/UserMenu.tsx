import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Avatar } from '../atoms/Avatar';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  className?: string;
}

export const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  ({ userName = 'Support User', userEmail = 'support@company.com', userAvatar, onLogout, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
      onLogout?.();
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-accent/20 transition-colors"
        >
          <Avatar
            src={userAvatar}
            alt={userName}
            fallback={userName.split(' ').map(n => n[0]).join('')}
            size="sm"
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-20">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-secondary-foreground">{userEmail}</p>
              </div>
              <div className="p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Icon icon={LogOut} size="sm" />
                  Logout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

UserMenu.displayName = 'UserMenu';