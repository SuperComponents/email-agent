import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Icon } from './Icon';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ options, value, onChange, className, disabled = false }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value) || options[0];

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleOptionClick = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <div ref={dropdownRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="gap-1 pr-1 w-36"
          >
            {selectedOption.icon && <Icon icon={selectedOption.icon} size="sm" />}
            <span className="text-nowrap">{selectedOption.label}</span>
            <Icon
              icon={ChevronDown}
              size="sm"
              className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </Button>

          {isOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-36 bg-card border border-border rounded-md shadow-lg z-50">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition-colors',
                    'first:rounded-t-md last:rounded-b-md',
                    value === option.value && 'bg-accent',
                  )}
                >
                  {option.icon && <Icon icon={option.icon} size="sm" />}
                  <span className="text-nowrap">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
