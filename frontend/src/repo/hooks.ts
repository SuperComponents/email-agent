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
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 errors
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    throwOnError: false, // Don't throw errors to console for 404s
  });
}

// Agent queries
export function useAgentActivity(threadId: string) {
  return useQuery({
    queryKey: queryKeys.agentActivity(threadId),
    queryFn: () => APIClient.getAgentActivity(threadId),
    enabled: !!threadId,
    refetchInterval: 200, // Poll 5 times per second
  });
}

// Mutations
export function useUpdateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: string; tags?: string[] } }) =>
      APIClient.updateThread(id, updates),
    onSuccess: (_, variables) => {
      // Invalidate and refetch thread data
      void queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.threadCounts });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      APIClient.sendMessage(threadId, content),
    onSuccess: (_, variables) => {
      // Invalidate thread to refetch with new message
      void queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
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
    onSuccess: (_, variables) => {
      // Invalidate draft and agent activity
      void queryClient.invalidateQueries({ queryKey: queryKeys.draft(variables.threadId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.agentActivity(variables.threadId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
    },
  });
}

export function useCreateInternalNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ threadId, content, isPinned }: { threadId: string; content: string; isPinned?: boolean }) =>
      APIClient.createInternalNote(threadId, content, isPinned),
    onSuccess: (_, variables) => {
      // Invalidate thread to refetch with new internal note
      void queryClient.invalidateQueries({ queryKey: queryKeys.thread(variables.threadId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
    },
  });
}

// Email simulation hooks
export function useSimulationStatus() {
  return useQuery({
    queryKey: ['simulation-status'],
    queryFn: () => APIClient.getSimulationStatus(),
    refetchInterval: 2000, // Poll every 2 seconds when simulation might be running
  });
}

export function useStartEmailSimulation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ intervalMs }: { intervalMs?: number } = {}) =>
      APIClient.startEmailSimulation(intervalMs),
    onSuccess: () => {
      // Invalidate simulation status to refetch
      void queryClient.invalidateQueries({ queryKey: ['simulation-status'] });
    },
  });
}

export function useStopEmailSimulation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => APIClient.stopEmailSimulation(),
    onSuccess: () => {
      // Invalidate simulation status to refetch
      void queryClient.invalidateQueries({ queryKey: ['simulation-status'] });
    },
  });
}

export function useGenerateSingleEmail() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => APIClient.generateSingleEmail(),
    onSuccess: () => {
      // Invalidate threads to show new email
      void queryClient.invalidateQueries({ queryKey: queryKeys.threads() });
      void queryClient.invalidateQueries({ queryKey: ['simulation-status'] });
    },
  });
}