import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-store';
import { useNavigate } from 'react-router-dom';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
        }
      }

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isDropdownOpen]);

    const handleLogout = () => {
      logout();
      navigate('/login');
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
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  fallback={user.initials}
                  size="sm"
                />
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
                  >
                    <Icon icon={LogOut} size="sm" />
                    Log out
                  </button>
                </div>
              )}
            </div>
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