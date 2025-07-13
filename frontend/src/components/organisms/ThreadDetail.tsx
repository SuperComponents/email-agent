import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { Lock } from 'lucide-react';
import { Icon } from '../atoms/Icon';
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
}

export const ThreadDetail = React.forwardRef<HTMLDivElement, ThreadDetailProps>(
  ({ className, subject, messages, status = 'open', tags = [], ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col h-full', className)} {...props}>
        <div className="px-6 py-2 border-b border-border h-[60px] flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            <h2 className="text-xl font-semibold text-nowrap">{subject}</h2>
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
                      <span className="text-sm text-secondary-foreground">
                        {message.author.email}
                      </span>
                      {isInternalNote && (
                        <>
                          <Icon icon={Lock} size="sm" className="text-accent-foreground" />
                          <span className="text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded">
                            Internal Note
                          </span>
                          {noteMessage.isPinned && <span className="text-xs">📌</span>}
                        </>
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
        </div>
      </div>
    );
  },
);

ThreadDetail.displayName = 'ThreadDetail';
