import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { emailThreads } from './emails';

export const agentActions = sqliteTable('agent_actions', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull().references(() => emailThreads.id),
  agentRunId: text('agent_run_id').notNull(),
  toolName: text('tool_name').notNull(),
  toolCallId: text('tool_call_id').notNull(),
  description: text('description').notNull(),
  parameters: text('parameters').notNull(), // JSON string
  result: text('result'), // JSON string
  status: text('status').notNull(), // 'success' | 'error'
  errorMessage: text('error_message'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  stepId: text('step_id').notNull(),
});