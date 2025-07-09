import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API } from './api-client';
import { MockAPI } from './mock-api';
import type { ThreadFilter } from '../types/api';

// Toggle between real API and mock API
const USE_REAL_API = import.meta.env.VITE_API_URL ? true : false;
const apiClient = USE_REAL_API ? API : MockAPI;

// Query keys
export const queryKeys = {
  threads: (filter?: ThreadFilter, search?: string) => ['threads', filter, search] as const,
  thread: (id: string) => ['thread', id] as const,
  draft: (threadId: string) => ['draft', threadId] as const,
  agentActivity: (threadId: string) => ['agentActivity', threadId] as const,
  threadCounts: ['threadCounts'] as const,
};

// Thread queries
export function useThreads(filter?: ThreadFilter, search?: string) {
  return useQuery({
    queryKey: queryKeys.threads(filter, search),
    queryFn: () => apiClient.getThreads(filter, search),
    placeholderData: (previousData) => previousData,
  });
}

export function useThread(id: string) {
  return useQuery({
    queryKey: queryKeys.thread(id),
    queryFn: () => apiClient.getThread(id),
    enabled: !!id,
  });
}

export function useThreadCounts() {
  return useQuery({
    queryKey: queryKeys.threadCounts,
    queryFn: () => apiClient.getThreadCounts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Draft queries
export function useDraft(threadId: string) {
  return useQuery({
    queryKey: queryKeys.draft(threadId),
    queryFn: () => apiClient.getDraft(threadId),
    enabled: !!threadId,
  });
}

// Agent queries
export function useAgentActivity(threadId: string) {
  return useQuery({
    queryKey: queryKeys.agentActivity(threadId),
    queryFn: () => apiClient.getAgentActivity(threadId),
    enabled: !!threadId,
  });
}

// Mutations
export function useUpdateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: string; tags?: string[] } }) =>
      apiClient.updateThread(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate and refetch thread data
      queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
      queryClient.invalidateQueries({ queryKey: queryKeys.threadCounts });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      apiClient.sendMessage(threadId, content),
    onSuccess: (data, variables) => {
      // Invalidate thread to refetch with new message
      queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
    },
  });
}

export function useUpdateDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      apiClient.updateDraft(threadId, content),
    onSuccess: (data, variables) => {
      // Update the draft in cache
      queryClient.setQueryData(queryKeys.draft(variables.threadId), data);
    },
  });
}

export function useRegenerateDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, instructions }: { threadId: string; instructions?: string }) =>
      apiClient.regenerateDraft(threadId, instructions),
    onSuccess: (data, variables) => {
      // Invalidate draft and agent activity
      queryClient.invalidateQueries({ queryKey: queryKeys.draft(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agentActivity(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
    },
  });
}