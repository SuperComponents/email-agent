import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useThread } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadDetail, type ThreadMessage } from '../components/organisms';
import { ComposerContainer, type ComposerContainerRef } from './ComposerContainer';

export interface ThreadDetailContainerRef {
  setDraftContent: (draft: { body: string }) => void;
}

export const ThreadDetailContainer = forwardRef<ThreadDetailContainerRef>((_, ref) => {
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const composerRef = useRef<ComposerContainerRef>(null);

  const { data: thread, isLoading, error } = useThread(selectedThreadId || '');

  // Expose method to set draft content from outside
  useImperativeHandle(ref, () => ({
    setDraftContent: (draft: { body: string }) => {
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

  // Combine emails and internal notes
  const allMessages: ThreadMessage[] = [
    // Map emails
    ...thread.emails.map(email => ({
      id: `email-${email.id}`,
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
    })),
    // Map internal notes
    ...(thread.internal_notes || []).map(note => ({
      id: `note-${note.id}`,
      author: {
        name: note.author.name,
        email: note.author.email,
        initials: note.author.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase(),
      },
      content: note.content,
      timestamp: new Date(note.created_at).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isPinned: note.is_pinned,
      canEdit: note.can_edit,
      type: 'internal_note' as const,
    }))
  ];

  // Sort by timestamp (oldest first, but pinned notes float to top within their timeframe)
  const sortedMessages = allMessages.sort((a, b) => {
    const aIsNote = 'type' in a && a.type === 'internal_note';
    const bIsNote = 'type' in b && b.type === 'internal_note';
    
    // If both are notes, pinned notes come first
    if (aIsNote && bIsNote) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }
    
    // Otherwise sort by timestamp
    const aTime = aIsNote ? new Date((thread.internal_notes || []).find(n => `note-${n.id}` === a.id)?.created_at || '').getTime() : 
                           new Date((thread.emails.find(e => `email-${e.id}` === a.id)?.timestamp || '')).getTime();
    const bTime = bIsNote ? new Date((thread.internal_notes || []).find(n => `note-${n.id}` === b.id)?.created_at || '').getTime() : 
                           new Date((thread.emails.find(e => `email-${e.id}` === b.id)?.timestamp || '')).getTime();
    
    return aTime - bTime;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <ThreadDetail
          subject={thread.subject}
          messages={sortedMessages}
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
