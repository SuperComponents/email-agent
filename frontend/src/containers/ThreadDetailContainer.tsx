import { useThread, queryKeys } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { ThreadDetail, type EmailMessage } from '../components/organisms';
import { ComposerContainer } from './ComposerContainer';
import { regenerateDraft, generateDemoCustomerResponse } from '../repo/api-client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function ThreadDetailContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const queryClient = useQueryClient();
  
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
  
  
  const handleUseAgent = async () => {
    if (!selectedThreadId) return;
    
    setIsRegenerating(true);
    try {
      const result = await regenerateDraft(selectedThreadId);
      console.log('Agent regenerate result:', result);
      
      // Refetch the thread data, draft, and agent activity
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.thread(selectedThreadId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.draft(selectedThreadId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.agentActivity(selectedThreadId) })
      ]);
    } catch (error) {
      console.error('Failed to regenerate draft with agent:', error);
      // You might want to show an error toast here
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleDemoCustomerResponse = async () => {
    if (!selectedThreadId) return;
    
    setIsGeneratingDemo(true);
    try {
      const result = await generateDemoCustomerResponse(selectedThreadId);
      console.log('Demo customer response result:', result);
      
      // Refetch the thread data to show the new email
      await queryClient.invalidateQueries({ queryKey: queryKeys.thread(selectedThreadId) });
    } catch (error) {
      console.error('Failed to generate demo customer response:', error);
      // You might want to show an error toast here
    } finally {
      setIsGeneratingDemo(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ThreadDetail
        subject={thread.subject}
        messages={messages}
        status={thread.status as 'open' | 'closed' | 'pending'}
        tags={thread.tags}
        onUseAgent={handleUseAgent}
        onDemoCustomerResponse={handleDemoCustomerResponse}
        isRegeneratingDraft={isRegenerating}
        isGeneratingDemoResponse={isGeneratingDemo}
      />
      <ComposerContainer />
    </div>
  );
}