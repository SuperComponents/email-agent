import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { cn } from '../../lib/utils';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  user?: {
    name: string;
    avatar?: string;
    initials?: string;
  };
  onMenuClick?: () => void;
  notificationCount?: number;
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, user, onMenuClick, notificationCount = 0, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'h-16 bg-card border-b border-border px-4 flex items-center justify-between',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Icon icon={Menu} size="sm" />
          </Button>
          <h1 className="text-xl font-semibold">ProResponse AI</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative">
            <Icon icon={Bell} size="sm" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
          
          {user ? (
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar
                src={user.avatar}
                alt={user.name}
                fallback={user.initials}
                size="sm"
              />
              <span className="hidden sm:inline">{user.name}</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm">
              <Icon icon={User} size="sm" />
            </Button>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';