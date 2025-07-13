import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThreads, useThreadCounts, useMarkThreadAsRead } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadList } from '../components/organisms';
import type { ThreadFilter } from '../types/api';
import type { ThreadPreviewProps } from '../components/molecules/ThreadPreview';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../repo/hooks';

export function ThreadListContainer() {
  const navigate = useNavigate();
  const threadFilter = useUIStore(state => state.threadFilter);
  const searchQuery = useUIStore(state => state.searchQuery);
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const setThreadFilter = useUIStore(state => state.setThreadFilter);
  const setSearchQuery = useUIStore(state => state.setSearchQuery);

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
  const queryClient = useQueryClient();
  const markAsRead = useMarkThreadAsRead();

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchValue(value);
  }, []);

  const handleThreadClick = useCallback(
    (threadId: string) => {
      // Find the current thread to check if it's unread
      const currentThread = threadsData?.threads.find(t => t.id === threadId);

      // Optimistically update the thread as read in the cache
      if (currentThread?.is_unread) {
        // Update threads list cache
        queryClient.setQueryData(queryKeys.threads(threadFilter, searchQuery), (oldData: any) => {
          if (!oldData?.threads) return oldData;
          return {
            ...oldData,
            threads: oldData.threads.map((thread: any) =>
              thread.id === threadId ? { ...thread, is_unread: false } : thread,
            ),
          };
        });

        // Update thread counts cache optimistically
        queryClient.setQueryData(queryKeys.threadCounts, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            unread: Math.max(0, (oldData.unread || 0) - 1),
          };
        });

        // Trigger the actual API call (but don't await it)
        markAsRead.mutate(threadId);
      }

      void navigate(`/thread/${threadId}`);
    },
    [navigate, threadsData, threadFilter, searchQuery, queryClient, markAsRead],
  );

  console.log(
    'threads',
    threadsData?.threads.filter(t => t.userActionRequired),
  );

  // Transform API threads to ThreadPreviewProps
  const threadPreviews: ThreadPreviewProps[] =
    threadsData?.threads.map(thread => ({
      id: thread.id,
      title: thread.subject,
      snippet: thread.snippet,
      author: {
        name: thread.customer_name,
        initials: thread.customer_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase(),
      },
      timestamp: new Date(thread.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isActive: thread.id === selectedThreadId,
      isUnread: thread.is_unread,
      workerActive: thread.worker_active,
      badges: [
        ...(thread.userActionRequired
          ? [
              {
                label: 'action required',
                variant: 'destructive' as const,
              },
            ]
          : []),
      ],
    })) || [];

  const filterOptions = [
    { id: 'all', label: 'All', count: counts?.all },
    { id: 'unread', label: 'Unread', count: counts?.unread },
    { id: 'urgent', label: 'Urgent', count: counts?.urgent },
  ];

  return (
    <ThreadList
      threads={threadPreviews}
      filters={filterOptions}
      activeFilter={threadFilter}
      activeThreadId={selectedThreadId || undefined}
      searchValue={localSearchValue}
      onSearchChange={handleSearchChange}
      onFilterChange={filterId => setThreadFilter(filterId as ThreadFilter)}
      onThreadClick={handleThreadClick}
    />
  );
}
