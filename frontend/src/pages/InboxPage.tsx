import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/templates';
import { Header } from '../components/organisms';
import { ThreadListContainer } from '../containers/ThreadListContainer';
import { ThreadDetailContainer, type ThreadDetailContainerRef } from '../containers/ThreadDetailContainer';
import { AgentPanelContainer } from '../containers/AgentPanelContainer';
import { useUIStore } from '../stores/ui-store';
import { regenerateDraft, generateDemoCustomerResponse } from '../repo/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../repo/hooks';

export function InboxPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const isAgentPanelOpen = useUIStore((state) => state.isAgentPanelOpen);
  const setSelectedThread = useUIStore((state) => state.setSelectedThread);
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const queryClient = useQueryClient();
  const threadDetailRef = useRef<ThreadDetailContainerRef>(null);

  const handleDraftClick = (draft: { body: string }) => {
    threadDetailRef.current?.setDraftContent(draft);
  };
  
  // Sync URL to store - single source of truth is the URL
  useEffect(() => {
    if (threadId) {
      setSelectedThread(threadId);
    } else {
      setSelectedThread(null);
    }
  }, [threadId, setSelectedThread]);
  
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
    } finally {
      setIsGeneratingDemo(false);
    }
  };
  
  return (
    <AppLayout
      sidebar={
        <div className="flex flex-col h-full">
          <Header />
          <ThreadListContainer />
        </div>
      }
      main={<ThreadDetailContainer ref={threadDetailRef} />}
      panel={isAgentPanelOpen ? 
        <AgentPanelContainer 
          onUseAgent={() => void handleUseAgent()}
          onDemoCustomerResponse={() => void handleDemoCustomerResponse()}
          isRegeneratingDraft={isRegenerating}
          isGeneratingDemoResponse={isGeneratingDemo}
          onDraftClick={handleDraftClick}
        /> : null}
    />
  );
}