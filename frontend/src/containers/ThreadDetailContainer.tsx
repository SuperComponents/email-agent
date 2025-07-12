import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useThread } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadDetail, type EmailMessage } from '../components/organisms';
import { ComposerContainer, type ComposerContainerRef } from './ComposerContainer';

export interface ThreadDetailContainerRef {
  setDraftContent: (draft: { subject?: string; body: string }) => void;
}

export const ThreadDetailContainer = forwardRef<ThreadDetailContainerRef>((_, ref) => {
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const composerRef = useRef<ComposerContainerRef>(null);

  const { data: thread, isLoading, error } = useThread(selectedThreadId || '');

  // Expose method to set draft content from outside
  useImperativeHandle(ref, () => ({
    setDraftContent: (draft: { subject?: string; body: string }) => {
      composerRef.current?.setDraftContent(draft);
    }
  }), []);

  if (!selectedThreadId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a thread to view details
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading thread: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (isLoading || !thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading thread...</div>
      </div>
    );
  }

  const messages: EmailMessage[] = thread.emails.map(email => ({
    id: email.id,
    author: {
      name: email.from_name,
      email: email.from_email,
      initials: email.from_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase(),
    },
    content: email.content,
    timestamp: new Date(email.timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isSupport: email.is_support_reply,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ThreadDetail
          subject={thread.subject}
          messages={messages}
          status={thread.status as 'open' | 'closed' | 'pending'}
          tags={thread.tags}
        />
      </div>
      <div className="flex-shrink-0">
        <ComposerContainer ref={composerRef} />
      </div>
    </div>
  );
});
