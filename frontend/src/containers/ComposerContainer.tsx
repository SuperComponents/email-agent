import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useUIStore } from '../stores/ui-store';
import { useComposerStore } from '../stores/composer-store';
import { useDraft, useSendMessage, useRegenerateDraft, useThread, useCreateInternalNote } from '../repo/hooks';
import { Composer, type ComposerMode } from '../components/organisms';

export interface ComposerContainerRef {
  setDraftContent: (draft: { body: string }) => void;
}

export const ComposerContainer = forwardRef<ComposerContainerRef>((_, ref) => {
  const selectedThreadId = useUIStore(state => state.selectedThreadId);
  const setComposerOpen = useUIStore(state => state.setComposerOpen);

  const getDraft = useComposerStore(state => state.getDraft);
  const setDraft = useComposerStore(state => state.setDraft);
  const clearDraft = useComposerStore(state => state.clearDraft);

  const { data: serverDraft, error: draftError } = useDraft(selectedThreadId || '') as {
    data: { content: string; citations?: unknown } | undefined;
    error: { status?: number } | null;
  };
  const { data: thread } = useThread(selectedThreadId || '');
  const sendMessageMutation = useSendMessage();
  const regenerateDraftMutation = useRegenerateDraft();
  const createInternalNoteMutation = useCreateInternalNote();

  const [localContent, setLocalContent] = useState('');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [mode, setMode] = useState<ComposerMode>('reply');

  // Initialize content
  useEffect(() => {
    if (selectedThreadId) {
      const localDraft = getDraft(selectedThreadId);
      if (localDraft) {
        setLocalContent(localDraft);
        setComposerOpen(true, 'reply');
      } else if (serverDraft) {
        console.log('Draft response received:', serverDraft);
        console.log('Draft citations:', serverDraft.citations);
        setLocalContent(serverDraft.content);
        if (serverDraft.content.trim()) {
          setComposerOpen(true, 'reply');
        }
      } else if (draftError?.status === 404) {
        setLocalContent('');
      }
    }
  }, [selectedThreadId, serverDraft, getDraft, draftError, setComposerOpen]);

  // Initialize email fields
  useEffect(() => {
    if (thread && thread.emails && thread.emails.length > 0) {
      const lastEmail = thread.emails[thread.emails.length - 1];
      setTo(lastEmail.from_email);
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
    } catch (error) {
      console.error('Failed to regenerate draft:', error);
    }
  };

  const handleSendInternalNote = async () => {
    if (!selectedThreadId || !localContent.trim()) return;

    try {
      await createInternalNoteMutation.mutateAsync({
        threadId: selectedThreadId,
        content: localContent,
      });
      setLocalContent('');
      setMode('reply'); // Switch back to reply mode after sending note
    } catch (error) {
      console.error('Failed to create internal note:', error);
    }
  };

  // Expose method to set draft content from outside
  useImperativeHandle(ref, () => ({
    setDraftContent: (draft: { body: string }) => {
      if (selectedThreadId) {
        setLocalContent(draft.body);
        setDraft(selectedThreadId, draft.body);
        setComposerOpen(true, 'reply');
      }
    }
  }), [selectedThreadId, setDraft, setComposerOpen]);
  if (!selectedThreadId) {
    return null;
  }

  return (
    <Composer
      value={localContent}
      onChange={handleContentChange}
      onSend={() => void handleSend()}
      onSendInternalNote={() => void handleSendInternalNote()}
      onRegenerate={() => void handleRegenerate()}
      isGenerating={regenerateDraftMutation.isPending}
      isSending={sendMessageMutation.isPending || createInternalNoteMutation.isPending}
      citations={serverDraft?.citations as never}
      to={to}
      from="support@company.com"
      cc={cc}
      bcc={bcc}
      onToChange={setTo}
      onCcChange={setCc}
      onBccChange={setBcc}
      mode={mode}
      onModeChange={setMode}
    />
  );
});
