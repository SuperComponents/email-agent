import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/ui-store';
import { useComposerStore } from '../stores/composer-store';
import { useDraft, useSendMessage, useRegenerateDraft, useThread } from '../repo/hooks';
import { Composer } from '../components/organisms';

export function ComposerContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const setComposerOpen = useUIStore((state) => state.setComposerOpen);
  
  const getDraft = useComposerStore((state) => state.getDraft);
  const setDraft = useComposerStore((state) => state.setDraft);
  const clearDraft = useComposerStore((state) => state.clearDraft);
  
  const { data: serverDraft, error: draftError } = useDraft(selectedThreadId || '');
  const { data: thread } = useThread(selectedThreadId || '');
  const sendMessageMutation = useSendMessage();
  const regenerateDraftMutation = useRegenerateDraft();
  
  const [localContent, setLocalContent] = useState('');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  
  // Initialize content from server draft or local draft
  useEffect(() => {
    if (selectedThreadId) {
      const localDraft = getDraft(selectedThreadId);
      if (localDraft) {
        setLocalContent(localDraft);
        // Auto-open composer if there's a local draft
        setComposerOpen(true, 'reply');
      } else if (serverDraft) {
        console.log('Draft response received:', serverDraft);
        console.log('Draft citations:', serverDraft.citations);
        setLocalContent(serverDraft.content);
        // Auto-open composer if there's a server draft with content
        if (serverDraft.content.trim()) {
          setComposerOpen(true, 'reply');
        }
      } else if ((draftError as any)?.status === 404) {
        // No draft exists yet, start with empty content
        setLocalContent('');
      }
    }
  }, [selectedThreadId, serverDraft, getDraft, draftError, setComposerOpen]);

  // Initialize email fields from thread data
  useEffect(() => {
    if (thread && thread.emails && thread.emails.length > 0) {
      const lastEmail = thread.emails[thread.emails.length - 1];
      // Set To field to the original sender for replies
      setTo(lastEmail.from_email);
      // CC and BCC can be empty by default
      setCc('');
      setBcc('');
    }
  }, [thread]);
  
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
  
  if (!selectedThreadId) {
    return null;
  }
  
  return (
    <Composer
      value={localContent}
      onChange={handleContentChange}
      onSend={handleSend}
      onRegenerate={handleRegenerate}
      isGenerating={regenerateDraftMutation.isPending}
      isSending={sendMessageMutation.isPending}
      citations={serverDraft?.citations}
      to={to}
      from="support@company.com"
      cc={cc}
      bcc={bcc}
      onToChange={setTo}
      onCcChange={setCc}
      onBccChange={setBcc}
    />
  );
}