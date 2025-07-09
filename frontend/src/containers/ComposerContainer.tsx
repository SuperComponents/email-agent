import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/ui-store';
import { useComposerStore } from '../stores/composer-store';
import { useDraft, useUpdateDraft, useSendMessage, useRegenerateDraft } from '../repo/hooks';
import { Composer } from '../components/organisms';

export function ComposerContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const isComposerOpen = useUIStore((state) => state.isComposerOpen);
  const setComposerOpen = useUIStore((state) => state.setComposerOpen);
  
  const getDraft = useComposerStore((state) => state.getDraft);
  const setDraft = useComposerStore((state) => state.setDraft);
  const clearDraft = useComposerStore((state) => state.clearDraft);
  
  const { data: serverDraft } = useDraft(selectedThreadId || '');
  const updateDraftMutation = useUpdateDraft();
  const sendMessageMutation = useSendMessage();
  const regenerateDraftMutation = useRegenerateDraft();
  
  const [localContent, setLocalContent] = useState('');
  
  // Initialize content from server draft or local draft
  useEffect(() => {
    if (selectedThreadId) {
      const localDraft = getDraft(selectedThreadId);
      if (localDraft) {
        setLocalContent(localDraft);
      } else if (serverDraft) {
        setLocalContent(serverDraft.content);
      }
    }
  }, [selectedThreadId, serverDraft, getDraft]);
  
  const handleContentChange = (content: string) => {
    setLocalContent(content);
    if (selectedThreadId) {
      setDraft(selectedThreadId, content);
    }
  };
  
  const handleSend = async () => {
    if (!selectedThreadId || !localContent.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        threadId: selectedThreadId,
        content: localContent,
      });
      
      // Clear draft after sending
      clearDraft(selectedThreadId);
      setLocalContent('');
      setComposerOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!selectedThreadId) return;
    
    try {
      await updateDraftMutation.mutateAsync({
        threadId: selectedThreadId,
        content: localContent,
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };
  
  const handleCancel = () => {
    setComposerOpen(false);
  };
  
  const handleRegenerate = async () => {
    if (!selectedThreadId) return;
    
    try {
      await regenerateDraftMutation.mutateAsync({
        threadId: selectedThreadId,
      });
      
      // The draft will be updated via React Query cache invalidation
      // and will trigger the useEffect above to update local content
    } catch (error) {
      console.error('Failed to regenerate draft:', error);
    }
  };
  
  if (!isComposerOpen || !selectedThreadId) {
    return null;
  }
  
  return (
    <Composer
      value={localContent}
      onChange={handleContentChange}
      onSend={handleSend}
      onCancel={handleCancel}
      onSaveDraft={handleSaveDraft}
      onRegenerate={handleRegenerate}
      isGenerating={regenerateDraftMutation.isPending}
      isSending={sendMessageMutation.isPending}
      isSavingDraft={updateDraftMutation.isPending}
    />
  );
}