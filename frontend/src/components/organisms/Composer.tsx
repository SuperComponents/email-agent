import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface ComposerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const Composer = React.forwardRef<HTMLDivElement, ComposerProps>(
  ({ 
    className, 
    value = '', 
    onChange, 
    onSend, 
    placeholder = 'Type your reply...', 
    disabled = false,
    ...props 
  }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onSend?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-t border-border bg-card',
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-ring">
            <textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none min-h-[100px] max-h-[300px]"
              rows={4}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Icon icon={Paperclip} size="sm" />
                </Button>
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Icon icon={Smile} size="sm" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={onSend}
                disabled={disabled || !value.trim()}
                className="gap-2"
              >
                <span>Send</span>
                <Icon icon={Send} size="sm" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-secondary-foreground mt-2">
            Press Cmd+Enter to send
          </p>
        </div>
      </div>
    );
  }
);

Composer.displayName = 'Composer';