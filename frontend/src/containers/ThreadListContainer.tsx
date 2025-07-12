import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThreads, useThreadCounts } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadList } from '../components/organisms';
import type { ThreadFilter } from '../types/api';
import type { ThreadPreviewProps } from '../components/molecules/ThreadPreview';

export function ThreadListContainer() {
  const navigate = useNavigate();
  const threadFilter = useUIStore((state) => state.threadFilter);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const setThreadFilter = useUIStore((state) => state.setThreadFilter);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  
  // Local search state for immediate UI updates
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery);
  
  // Debounce search query updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localSearchValue);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [localSearchValue, setSearchQuery]);
  
  const { data: threadsData } = useThreads(threadFilter, searchQuery);
  const { data: counts } = useThreadCounts();
  
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchValue(value);
  }, []);
  
  const handleThreadClick = useCallback((threadId: string) => {
    void navigate(`/thread/${threadId}`);
  }, [navigate]);
  
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
        variant: thread.status === 'closed' ? 'secondary' as const : 'default' as const
      }] : []),
      ...thread.tags.map(tag => ({ 
        label: tag, 
        variant: tag === 'urgent' ? 'destructive' as const : 'outline' as const
      }))
    ]
  })) || [];
  
  const filterOptions = [
    { id: 'all', label: 'All', count: counts?.all },
    { id: 'unread', label: 'Unread', count: counts?.unread },
    { id: 'urgent', label: 'Urgent', count: counts?.urgent },
    { id: 'awaiting_customer', label: 'Pending', count: counts?.awaiting_customer },
  ];
  
  return (
    <ThreadList
      threads={threadPreviews}
      filters={filterOptions}
      activeFilter={threadFilter}
      activeThreadId={selectedThreadId || undefined}
      searchValue={localSearchValue}
      onSearchChange={handleSearchChange}
      onFilterChange={(filterId) => setThreadFilter(filterId as ThreadFilter)}
      onThreadClick={handleThreadClick}
    />
  );
}