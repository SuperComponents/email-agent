import { z } from 'zod';
import { Event } from './types';

// Base message schema
const BaseMessageSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
});

// Command messages from main thread to worker
export const StartCommandSchema = BaseMessageSchema.extend({
  type: z.literal('start'),
  data: z.object({
    initialEventLog: z.array(z.any()), // Event[] but using any for now due to Date serialization
    openaiApiKey: z.string().optional(),
  }),
});

export const StopCommandSchema = BaseMessageSchema.extend({
  type: z.literal('stop'),
  data: z.object({
    reason: z.string().optional(),
  }),
});

// Request/Response messages for callbacks
export const GetEventStateRequestSchema = BaseMessageSchema.extend({
  type: z.literal('get_event_state_request'),
  data: z.object({}),
});

export const GetEventStateResponseSchema = BaseMessageSchema.extend({
  type: z.literal('get_event_state_response'),
  data: z.object({
    requestId: z.string(),
    eventLog: z.array(z.any()), // Event[] but using any for now
  }),
});

export const UpdateEventStateRequestSchema = BaseMessageSchema.extend({
  type: z.literal('update_event_state_request'),
  data: z.object({
    event: z.any(), // Event but using any for now
  }),
});

export const UpdateEventStateResponseSchema = BaseMessageSchema.extend({
  type: z.literal('update_event_state_response'),
  data: z.object({
    requestId: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  }),
});

// Status messages from worker to main thread
export const WorkerStatusSchema = BaseMessageSchema.extend({
  type: z.literal('worker_status'),
  data: z.object({
    status: z.enum(['starting', 'running', 'stopping', 'stopped', 'error']),
    message: z.string().optional(),
    error: z.string().optional(),
  }),
});

export const WorkerErrorSchema = BaseMessageSchema.extend({
  type: z.literal('worker_error'),
  data: z.object({
    error: z.string(),
    stack: z.string().optional(),
  }),
});

// Union of all message types
export const WorkerMessageSchema = z.union([
  StartCommandSchema,
  StopCommandSchema,
  GetEventStateRequestSchema,
  GetEventStateResponseSchema,
  UpdateEventStateRequestSchema,
  UpdateEventStateResponseSchema,
  WorkerStatusSchema,
  WorkerErrorSchema,
]);

// TypeScript types
export type StartCommand = z.infer<typeof StartCommandSchema>;
export type StopCommand = z.infer<typeof StopCommandSchema>;
export type GetEventStateRequest = z.infer<typeof GetEventStateRequestSchema>;
export type GetEventStateResponse = z.infer<typeof GetEventStateResponseSchema>;
export type UpdateEventStateRequest = z.infer<typeof UpdateEventStateRequestSchema>;
export type UpdateEventStateResponse = z.infer<typeof UpdateEventStateResponseSchema>;
export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;
export type WorkerError = z.infer<typeof WorkerErrorSchema>;
export type WorkerMessage = z.infer<typeof WorkerMessageSchema>;

// Callback interface for the main thread
export interface WorkerCallbacks {
  getEventState: () => Promise<Event[]>;
  updateEventState: (event: Event) => Promise<void>;
}

// Configuration for the agent worker
export interface AgentWorkerConfig {
  openaiApiKey?: string;
  callbacks: WorkerCallbacks;
}

// Worker status enum for easier usage
export enum WorkerStatusEnum {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

// Helper function to create messages with proper timestamps and IDs
export function createMessage<T extends WorkerMessage>(
  type: T['type'],
  data: T['data'],
  id?: string
): T {
  return {
    id: id || Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    type,
    data,
  } as T;
}