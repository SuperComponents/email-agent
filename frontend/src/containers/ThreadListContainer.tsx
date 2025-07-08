import { useThreads, useThreadCounts } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadList } from '../components/organisms';
import type { ThreadFilter } from '../types/api';
import type { ThreadPreviewProps } from '../components/molecules/ThreadPreview';

export function ThreadListContainer() {
  const threadFilter = useUIStore((state) => state.threadFilter);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const setThreadFilter = useUIStore((state) => state.setThreadFilter);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedThread = useUIStore((state) => state.setSelectedThread);
  
  const { data: threadsData, isLoading } = useThreads(threadFilter, searchQuery);
  const { data: counts } = useThreadCounts();
  
  // Transform API threads to ThreadPreviewProps
  const threadPreviews: ThreadPreviewProps[] = threadsData?.threads.map(thread => ({
    id: thread.id,
    title: thread.subject,
    snippet: thread.snippet,
    author: {
      name: thread.customer_name,
      initials: thread.customer_name.split(' ').map(n => n[0]).join('').toUpperCase()
    },
    timestamp: new Date(thread.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    isActive: thread.id === selectedThreadId,
    isUnread: thread.is_unread,
    badges: [
      ...(thread.status !== 'open' ? [{ 
        label: thread.status, 
        variant: thread.status === 'closed' ? 'secondary' : 'default' as const 
      }] : []),
      ...thread.tags.map(tag => ({ 
        label: tag, 
        variant: tag === 'urgent' ? 'destructive' : 'outline' as const 
      }))
    ]
  })) || [];
  
  const filterOptions = [
    { id: 'all', label: 'All', count: counts?.all },
    { id: 'unread', label: 'Unread', count: counts?.unread },
    { id: 'flagged', label: 'Flagged', count: counts?.flagged },
    { id: 'urgent', label: 'Urgent', count: counts?.urgent },
    { id: 'awaiting_customer', label: 'Awaiting Customer', count: counts?.awaiting_customer },
    { id: 'closed', label: 'Closed', count: counts?.closed },
  ];
  
  if (isLoading && threadPreviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Loading threads...</div>
      </div>
    );
  }
  
  return (
    <ThreadList
      threads={threadPreviews}
      filters={filterOptions}
      activeFilter={threadFilter}
      activeThreadId={selectedThreadId}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onFilterChange={(filterId) => setThreadFilter(filterId as ThreadFilter)}
      onThreadClick={setSelectedThread}
    />
  );
}