import { useThread } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadDetail, type EmailMessage } from '../components/organisms';
import { ComposerContainer } from './ComposerContainer';

export function ThreadDetailContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  
  const { data: thread, isLoading, error } = useThread(selectedThreadId || '');
  
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
        Error loading thread: {(error as Error).message}
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
  
  // Transform emails to EmailMessage format
  const messages: EmailMessage[] = thread.emails.map(email => ({
    id: email.id,
    author: {
      name: email.from_name,
      email: email.from_email,
      initials: email.from_name.split(' ').map(n => n[0]).join('').toUpperCase()
    },
    content: email.content,
    timestamp: new Date(email.timestamp).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    isSupport: email.is_support_reply
  }));
  
  return (
    <div className="flex flex-col h-full">
      <ThreadDetail
        subject={thread.subject}
        messages={messages}
        status={thread.status as 'open' | 'closed' | 'pending'}
        tags={thread.tags}
      />
      <ComposerContainer />
    </div>
  );
}