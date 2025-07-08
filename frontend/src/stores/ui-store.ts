import { create } from 'zustand';
import type { ThreadFilter } from '../types/api';

interface UIState {
  // Thread list state
  selectedThreadId: string | null;
  threadFilter: ThreadFilter;
  searchQuery: string;
  
  // Composer state
  isComposerOpen: boolean;
  composerMode: 'reply' | 'new';
  
  // Agent panel state
  isAgentPanelOpen: boolean;
  
  // Actions
  setSelectedThread: (id: string | null) => void;
  setThreadFilter: (filter: ThreadFilter) => void;
  setSearchQuery: (query: string) => void;
  setComposerOpen: (open: boolean, mode?: 'reply' | 'new') => void;
  setAgentPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  selectedThreadId: null,
  threadFilter: 'all',
  searchQuery: '',
  isComposerOpen: false,
  composerMode: 'reply',
  isAgentPanelOpen: true,
  
  // Actions
  setSelectedThread: (id) => set({ selectedThreadId: id }),
  
  setThreadFilter: (filter) => set({ threadFilter: filter }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setComposerOpen: (open, mode = 'reply') => set({ 
    isComposerOpen: open,
    composerMode: mode,
  }),
  
  setAgentPanelOpen: (open) => set({ isAgentPanelOpen: open }),
}));