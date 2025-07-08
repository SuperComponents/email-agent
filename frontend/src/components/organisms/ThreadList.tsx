import React from 'react';
import { SearchInput } from '../molecules/SearchInput';
import { FilterPills, type FilterOption } from '../molecules/FilterPills';
import { ThreadPreview, type ThreadPreviewProps } from '../molecules/ThreadPreview';
import { cn } from '../../lib/utils';

export interface ThreadListProps extends React.HTMLAttributes<HTMLDivElement> {
  threads: ThreadPreviewProps[];
  filters?: FilterOption[];
  activeFilter?: string;
  activeThreadId?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (filterId: string) => void;
  onThreadClick?: (threadId: string) => void;
}

export const ThreadList = React.forwardRef<HTMLDivElement, ThreadListProps>(
  ({ 
    className, 
    threads, 
    filters = [],
    activeFilter,
    activeThreadId,
    searchValue,
    onSearchChange,
    onFilterChange,
    onThreadClick,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-card',
          className
        )}
        {...props}
      >
        <div className="p-4 border-b border-border space-y-3">
          <SearchInput
            placeholder="Search threads..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {filters.length > 0 && (
            <FilterPills
              options={filters}
              value={activeFilter}
              onValueChange={onFilterChange}
            />
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread, index) => (
            <ThreadPreview
              key={thread.id || index}
              {...thread}
              isActive={thread.id === activeThreadId}
              onClick={() => thread.id && onThreadClick?.(thread.id)}
            />
          ))}
          {threads.length === 0 && (
            <div className="p-8 text-center text-secondary-foreground">
              No threads found
            </div>
          )}
        </div>
      </div>
    );
  }
);

ThreadList.displayName = 'ThreadList';