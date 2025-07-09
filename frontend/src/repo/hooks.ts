import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './api-client';
import type { ThreadFilter } from '../types/api';

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
    queryFn: () => APIClient.getThreads(filter, search),
    placeholderData: (previousData) => previousData,
  });
}

export function useThread(id: string) {
  return useQuery({
    queryKey: queryKeys.thread(id),
    queryFn: () => APIClient.getThread(id),
    enabled: !!id,
  });
}

export function useThreadCounts() {
  return useQuery({
    queryKey: queryKeys.threadCounts,
    queryFn: () => APIClient.getThreadCounts(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Draft queries
export function useDraft(threadId: string) {
  return useQuery({
    queryKey: queryKeys.draft(threadId),
    queryFn: () => APIClient.getDraft(threadId),
    enabled: !!threadId,
  });
}

// Agent queries
export function useAgentActivity(threadId: string) {
  return useQuery({
    queryKey: queryKeys.agentActivity(threadId),
    queryFn: () => APIClient.getAgentActivity(threadId),
    enabled: !!threadId,
  });
}

// Mutations
export function useUpdateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: string; tags?: string[] } }) =>
      APIClient.updateThread(id, updates),
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
      APIClient.sendMessage(threadId, content),
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
      APIClient.updateDraft(threadId, content),
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
      APIClient.regenerateDraft(threadId, instructions),
    onSuccess: (data, variables) => {
      // Invalidate draft and agent activity
      queryClient.invalidateQueries({ queryKey: queryKeys.draft(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.agentActivity(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
    },
  });
}