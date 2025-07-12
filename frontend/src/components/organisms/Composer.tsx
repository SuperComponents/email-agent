import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Sparkles, FileText, ExternalLink, MessageSquare, Lock } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';
import { Dropdown } from '../atoms/Dropdown';
import { EmailHeader } from '../molecules/EmailHeader';
import { cn } from '../../lib/utils';

export interface Citation {
  file_id: string;
  filename: string;
  score: number;
  text: string;
  attributes?: Record<string, unknown>;
}

export type ComposerMode = 'reply' | 'internal_note';

export interface ComposerProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  onSendInternalNote?: () => void;
  onRegenerate?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isGenerating?: boolean;
  isSending?: boolean;
  citations?: Citation[] | Citation;
  to?: string;
  from?: string;
  cc?: string;
  bcc?: string;
  onToChange?: (value: string) => void;
  onCcChange?: (value: string) => void;
  onBccChange?: (value: string) => void;
  mode?: ComposerMode;
  onModeChange?: (mode: ComposerMode) => void;
}

export const Composer = React.forwardRef<HTMLDivElement, ComposerProps>(
  ({ 
    className, 
    value = '', 
    onChange, 
    onSend,
    onSendInternalNote,
    onRegenerate, 
    placeholder, 
    disabled = false,
    isGenerating = false,
    isSending = false,
    citations = [],
    to = '',
    from = '',
    cc = '',
    bcc = '',
    onToChange,
    onCcChange,
    onBccChange,
    mode = 'reply',
    onModeChange,
    ...props 
  }, ref) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);

    const modeOptions = [
      { value: 'reply', label: 'Reply', icon: MessageSquare },
      { value: 'internal_note', label: 'Internal Note', icon: Lock },
    ];

    const isInternalNote = mode === 'internal_note';
    const actualPlaceholder = placeholder || (isInternalNote ? 'Add an internal note...' : 'Type your reply...');
    
    const handleSendClick = () => {
      if (isInternalNote) {
        onSendInternalNote?.();
      } else {
        onSend?.();
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSendClick();
      }
    };

    const handleEmojiClick = (emojiData: { emoji: string }) => {
      if (onChange) {
        onChange(value + emojiData.emoji);
      }
      setShowEmojiPicker(false);
    };

    // Close emoji picker when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
          const emojiPicker = document.querySelector('.EmojiPickerReact');
          if (emojiPicker && !emojiPicker.contains(event.target as Node)) {
            setShowEmojiPicker(false);
          }
        }
      };

      if (showEmojiPicker) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [showEmojiPicker]);

    return (
      <div
        ref={ref}
        className={cn(
          'border-t border-border bg-card',
          isInternalNote && 'bg-accent/10 border-accent/50',
          className
        )}
        {...props}
      >
        <div className={cn(
          "px-4 py-3 border-b border-border",
          isInternalNote ? "bg-accent/20" : "bg-card"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isInternalNote ? (
                <>
                  <Icon icon={Lock} size="sm" className="text-accent-foreground" />
                  <span className="font-medium text-accent-foreground">Internal Note</span>
                  <span className="text-xs text-accent-foreground/75">Only visible to support team</span>
                </>
              ) : (
                <span className="font-medium">Reply</span>
              )}
            </div>
            
            {onModeChange && (
              <Dropdown
                options={modeOptions}
                value={mode}
                onChange={(newMode) => onModeChange(newMode as ComposerMode)}
                disabled={disabled}
              />
            )}
          </div>
        </div>

        {!isInternalNote && (
          <EmailHeader
            to={to}
            from={from}
            cc={cc}
            bcc={bcc}
            onToChange={onToChange}
            onCcChange={onCcChange}
            onBccChange={onBccChange}
            disabled={disabled}
          />
        )}
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
          <div className={cn(
            "rounded-lg border border-border bg-input focus-within:ring-2 focus-within:ring-ring relative",
            isInternalNote && "border-accent/60 bg-accent/5"
          )}>
            {isGenerating && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                  <Spinner size="sm" />
                  <span>Generating response...</span>
                </div>
              </div>
            )}
            <textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={actualPlaceholder}
              disabled={disabled || isGenerating}
              className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none min-h-[200px] max-h-[500px]"
              rows={8}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border">
              <div className="flex gap-1">
                {!isInternalNote && (
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
                )}
                <Button variant="ghost" size="sm" disabled={disabled}>
                  <Icon icon={Paperclip} size="sm" />
                </Button>
                <div className="relative">
                  <Button 
                    ref={emojiButtonRef}
                    variant="ghost" 
                    size="sm" 
                    disabled={disabled}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Icon icon={Smile} size="sm" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 z-50">
                      <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        previewConfig={{
                          showPreview: false
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-secondary-foreground">
                  Press Cmd+Enter to {isInternalNote ? 'add note' : 'send'}
                </p>
                <Button
                  size="sm"
                  onClick={handleSendClick}
                  disabled={disabled || !value.trim() || isSending}
                  className={cn(
                    "gap-2",
                    isInternalNote && "bg-accent hover:bg-accent/80 text-accent-foreground"
                  )}
                  variant={isInternalNote ? "secondary" : "primary"}
                >
                  <Icon icon={isInternalNote ? Lock : Send} size="sm" />
                  <span>
                    {isSending 
                      ? (isInternalNote ? 'Adding Note...' : 'Sending...') 
                      : (isInternalNote ? 'Add Note' : 'Send')
                    }
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Composer.displayName = 'Composer';