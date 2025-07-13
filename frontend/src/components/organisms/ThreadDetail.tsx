import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { Badge } from '../atoms/Badge';
import { Lock, UserPlus } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';
import { cn } from '../../lib/utils';

export interface EmailMessage {
  id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  content: string;
  timestamp: string;
  isSupport?: boolean;
}

export interface InternalNoteMessage {
  id: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  content: string;
  timestamp: string;
  isPinned?: boolean;
  canEdit?: boolean;
  type: 'internal_note';
}

export type ThreadMessage = EmailMessage | InternalNoteMessage;

export interface ThreadDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  subject: string;
  messages: ThreadMessage[];
  status?: 'open' | 'closed' | 'pending';
  tags?: string[];
  onDemoCustomerResponse?: () => void;
  isGeneratingDemoResponse?: boolean;
}

export const ThreadDetail = React.forwardRef<HTMLDivElement, ThreadDetailProps>(
  ({ className, subject, messages, status = 'open', tags = [], onDemoCustomerResponse, isGeneratingDemoResponse, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)} {...props}>
        <div className="px-6 py-2 border-b border-border h-[60px] flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            <h2 className="text-xl font-semibold text-nowrap">{subject}</h2>
            <div className="flex gap-2">
              {status && (
                <Badge variant={status === 'closed' ? 'secondary' : 'default'}>{status}</Badge>
              )}
              {tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0">
          {messages.map(message => {
            const isInternalNote = 'type' in message && message.type === 'internal_note';
            const emailMessage = message as EmailMessage;
            const noteMessage = message as InternalNoteMessage;

            return (
              <article key={message.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={message.author.avatar}
                    alt={message.author.name}
                    fallback={message.author.initials}
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold">{message.author.name}</span>
                      {isInternalNote ? (
                        <div className="flex items-center gap-1 text-xs text-secondary-foreground">
                          <Icon icon={Lock} size="sm" />
                          <span>Internal Note</span>
                          {noteMessage.isPinned && <span className="text-xs">• Pinned</span>}
                        </div>
                      ) : (
                        <span className="text-sm text-secondary-foreground">
                          {emailMessage.author.email}
                        </span>
                      )}
                      <time className="text-sm text-secondary-foreground ml-auto">
                        {message.timestamp}
                      </time>
                    </div>
                    <div
                      className={cn(
                        'rounded-lg p-4',
                        isInternalNote
                          ? 'bg-accent/30 border border-accent/60'
                          : emailMessage.isSupport
                          ? 'bg-accent border border-accent-foreground/20'
                          : 'bg-card border border-border',
                      )}
                    >
                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          
          {onDemoCustomerResponse && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={onDemoCustomerResponse}
                size="sm"
                variant="secondary"
                className="gap-2"
                disabled={isGeneratingDemoResponse}
              >
                <Icon
                  icon={UserPlus}
                  size="sm"
                  className={isGeneratingDemoResponse ? 'animate-pulse' : ''}
                />
                <span>{isGeneratingDemoResponse ? 'Generating...' : 'Demo Customer Response'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ThreadDetail.displayName = 'ThreadDetail';