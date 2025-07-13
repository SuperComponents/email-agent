import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThreads, useThreadCounts, useMarkThreadAsRead, useAgentActivity } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadList } from '../components/organisms';
import type { ThreadFilter, Thread, ThreadCounts } from '../types/api';
import type { ThreadPreviewProps } from '../components/molecules/ThreadPreview';
import type { AgentActionProps } from '../components/molecules/AgentAction';
import { useQueryClient, useQueries } from '@tanstack/react-query';
import { queryKeys } from '../repo/hooks';
import { APIClient } from '../repo/api-client';

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
  const queryClient = useQueryClient();
  const markAsRead = useMarkThreadAsRead();
  
  // Fetch agent activity for all threads
  const threadIds = threadsData?.threads.map(t => t.id) || [];
  const agentActivityQueries = useQueries({
    queries: threadIds.map(threadId => ({
      queryKey: queryKeys.agentActivity(threadId),
      queryFn: () => APIClient.getAgentActivity(threadId),
      enabled: !!threadId,
      staleTime: 200, // Keep data fresh for 200ms
    }))
  });
  
  // Create a map of thread IDs to their working status
  const threadWorkingStatus = useMemo(() => {
    const statusMap = new Map<string, boolean>();
    
    threadIds.forEach((threadId, index) => {
      const agentActivity = agentActivityQueries[index]?.data;
      if (agentActivity?.actions && agentActivity.actions.length > 0) {
        // Apply the same logic as AgentPanel to determine if working
        // First, reverse the actions to show most recent at bottom (matching AgentPanelContainer)
        const actionsReversed = agentActivity.actions.slice().reverse();
        
        // Filter out function_call_result items
        const filteredActions = actionsReversed.filter((action: any) => 
          action.result?.type !== 'function_call_result'
        );
        
        // Check if there's at least one user message
        const hasUserMessage = filteredActions.some((action: any) => 
          action.result?.type === 'message' && action.result?.role === 'user'
        );
        
        // Get the last action (after filtering)
        const lastAction = filteredActions[filteredActions.length - 1];
        const lastActionIsAssistantMessage = lastAction?.result?.type === 'message' && 
          lastAction?.result?.role === 'assistant';
        const lastActionIsExplainToolCall = lastAction?.result?.name === 'explain_next_tool_call';
        
        const isWorking = hasUserMessage && (!lastActionIsAssistantMessage || lastActionIsExplainToolCall);
        
        statusMap.set(threadId, isWorking);
      } else {
        statusMap.set(threadId, false);
      }
    });
    
    return statusMap;
  }, [threadIds, agentActivityQueries]);
  
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchValue(value);
  }, []);
  
  const handleThreadClick = useCallback((threadId: string) => {
    // Find the current thread to check if it's unread
    const currentThread = threadsData?.threads.find(t => t.id === threadId);
    
    // Optimistically update the thread as read in the cache
    if (currentThread?.is_unread) {
      // Update threads list cache
      queryClient.setQueryData<{ threads: Thread[] }>(queryKeys.threads(threadFilter, searchQuery), (oldData) => {
        if (!oldData?.threads) return oldData;
        return {
          ...oldData,
          threads: oldData.threads.map((thread) => 
            thread.id === threadId 
              ? { ...thread, is_unread: false }
              : thread
          )
        };
      });
      
      // Update thread counts cache optimistically
      queryClient.setQueryData<ThreadCounts>(queryKeys.threadCounts, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          unread: Math.max(0, (oldData.unread || 0) - 1)
        };
      });
      
      // Trigger the actual API call (but don't await it)
      markAsRead.mutate(threadId);
    }
    
    void navigate(`/thread/${threadId}`);
  }, [navigate, threadsData, threadFilter, searchQuery, queryClient, markAsRead]);
  
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
    workerActive: threadWorkingStatus.get(thread.id) || false,
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