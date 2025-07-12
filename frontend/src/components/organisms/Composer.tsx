import React from 'react';
import { Send, Paperclip, Smile, Save, Sparkles, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../../lib/utils';

export interface Citation {
  file_id: string;
  filename: string;
  score: number;
  text: string;
  attributes?: Record<string, unknown>;
}

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
  citations?: Citation[] | Citation;
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
    citations = [],
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
          {citations && (Array.isArray(citations) ? citations.length > 0 : citations.text) && (
            <div className="mb-3 p-3 bg-accent/50 rounded-lg border border-accent-foreground/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon={FileText} size="sm" className="text-accent-foreground" />
                <span className="text-sm font-medium text-accent-foreground">Citations</span>
              </div>
              <div className="space-y-2">
                {(Array.isArray(citations) ? citations : [citations]).map((citation, index) => (
                  <div key={citation.file_id || index} className="flex items-start gap-2">
                    <span className="text-xs text-secondary-foreground mt-0.5">{index + 1}.</span>
                    <div className="flex-1">
                      <a 
                        href={`http://localhost:3005/#/${citation.filename.split('/').slice(1).join('/')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        title={citation.text}
                      >
                        {citation.filename.split('/').pop()?.replace('.md', '') || citation.filename}
                        <Icon icon={ExternalLink} size="sm" />
                      </a>
                      <span className="text-xs text-secondary-foreground ml-2">
                        (relevance: {Math.round(citation.score * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-ring">
            <textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none min-h-[200px] max-h-[500px]"
              rows={8}
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