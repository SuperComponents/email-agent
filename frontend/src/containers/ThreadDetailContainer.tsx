import React from 'react';
import { useThread, useUpdateThread } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadDetail } from '../components/organisms';
import { Badge } from '../components/atoms';

export function ThreadDetailContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const setComposerOpen = useUIStore((state) => state.setComposerOpen);
  
  const { data: thread, isLoading, error } = useThread(selectedThreadId || '');
  const updateThread = useUpdateThread();
  
  const handleReply = () => {
    setComposerOpen(true, 'reply');
  };
  
  const handleStatusChange = (status: string) => {
    if (!selectedThreadId) return;
    
    updateThread.mutate({
      id: selectedThreadId,
      updates: { status },
    });
  };
  
  const handleTagToggle = (tag: string) => {
    if (!selectedThreadId || !thread) return;
    
    const newTags = thread.tags.includes(tag)
      ? thread.tags.filter(t => t !== tag)
      : [...thread.tags, tag];
    
    updateThread.mutate({
      id: selectedThreadId,
      updates: { tags: newTags },
    });
  };
  
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
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{thread.subject}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {thread.customer.name} • {thread.customer.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={thread.status === 'closed' ? 'secondary' : 'default'}>
              {thread.status}
            </Badge>
            {thread.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ThreadDetail
          thread={thread}
          onReply={handleReply}
          onStatusChange={handleStatusChange}
          onTagToggle={handleTagToggle}
        />
      </div>
    </div>
  );
}