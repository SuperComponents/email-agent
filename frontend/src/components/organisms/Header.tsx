import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth-store';
import { useNavigate } from 'react-router-dom';
import { UserButton } from '@stackframe/react';

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
<UserButton />




  
      </header>
    );
  }
);

Header.displayName = 'Header';