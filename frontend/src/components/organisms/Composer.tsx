import React from 'react';
import { Send, Paperclip, Smile, Save, Sparkles } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface ComposerProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onRegenerate?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isGenerating?: boolean;
  isSending?: boolean;
  isSavingDraft?: boolean;
}

export const Composer = React.forwardRef<HTMLDivElement, ComposerProps>(
  ({ 
    className, 
    value = '', 
    onChange, 
    onSend,
    onCancel,
    onSaveDraft,
    onRegenerate, 
    placeholder = 'Type your reply...', 
    disabled = false,
    isGenerating = false,
    isSending = false,
    isSavingDraft = false,
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  disabled={disabled || isGenerating}
                  title="Generate with AI"
                >
                  <Icon icon={Sparkles} size="sm" />
                  {isGenerating && <span className="ml-1 text-xs">Generating...</span>}
                </Button>
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Icon icon={Paperclip} size="sm" />
                </Button>
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Icon icon={Smile} size="sm" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={disabled}
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSaveDraft}
                  disabled={disabled || isSavingDraft}
                  className="gap-1"
                >
                  <Icon icon={Save} size="sm" />
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={onSend}
                  disabled={disabled || !value.trim() || isSending}
                  className="gap-2"
                >
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                  <Icon icon={Send} size="sm" />
                </Button>
              </div>
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