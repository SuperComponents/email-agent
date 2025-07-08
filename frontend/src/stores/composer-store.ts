import { create } from 'zustand';

interface ComposerState {
  // Draft content by thread ID
  drafts: Record<string, string>;
  
  // Current editor state
  currentThreadId: string | null;
  isDirty: boolean;
  
  // Actions
  setDraft: (threadId: string, content: string) => void;
  getDraft: (threadId: string) => string;
  clearDraft: (threadId: string) => void;
  setCurrentThread: (threadId: string | null) => void;
  setDirty: (dirty: boolean) => void;
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  // Initial state
  drafts: {},
  currentThreadId: null,
  isDirty: false,
  
  // Actions
  setDraft: (threadId, content) => {
    set((state) => ({
      drafts: {
        ...state.drafts,
        [threadId]: content,
      },
      isDirty: true,
    }));
  },
  
  getDraft: (threadId) => {
    return get().drafts[threadId] || '';
  },
  
  clearDraft: (threadId) => {
    set((state) => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[threadId];
      return {
        drafts: newDrafts,
        isDirty: false,
      };
    });
  },
  
  setCurrentThread: (threadId) => {
    set({ currentThreadId: threadId });
  },
  
  setDirty: (dirty) => {
    set({ isDirty: dirty });
  },
}));