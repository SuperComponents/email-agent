import React from 'react';
import { useThreads, useThreadCounts } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadList } from '../components/organisms';
import { FilterPills } from '../components/molecules';
import { SearchInput } from '../components/molecules';
import type { ThreadFilter } from '../types/api';

export function ThreadListContainer() {
  const threadFilter = useUIStore((state) => state.threadFilter);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const setThreadFilter = useUIStore((state) => state.setThreadFilter);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedThread = useUIStore((state) => state.setSelectedThread);
  
  const { data: threadsData, isLoading, error } = useThreads(threadFilter, searchQuery);
  const { data: counts } = useThreadCounts();
  
  const handleFilterChange = (filter: ThreadFilter) => {
    setThreadFilter(filter);
  };
  
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleThreadSelect = (threadId: string) => {
    setSelectedThread(threadId);
  };
  
  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading threads: {(error as Error).message}
      </div>
    );
  }
  
  const filters = [
    { value: 'all' as const, label: 'All', count: counts?.all },
    { value: 'unread' as const, label: 'Unread', count: counts?.unread },
    { value: 'flagged' as const, label: 'Flagged', count: counts?.flagged },
    { value: 'urgent' as const, label: 'Urgent', count: counts?.urgent },
    { value: 'awaiting_customer' as const, label: 'Awaiting Customer', count: counts?.awaiting_customer },
    { value: 'closed' as const, label: 'Closed', count: counts?.closed },
  ];
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search threads..."
        />
        <FilterPills
          filters={filters}
          activeFilter={threadFilter}
          onFilterChange={handleFilterChange}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ThreadList
          threads={threadsData?.threads || []}
          selectedThreadId={selectedThreadId}
          onThreadSelect={handleThreadSelect}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}