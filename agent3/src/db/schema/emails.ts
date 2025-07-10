import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const emailThreads = sqliteTable('email_threads', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const emails = sqliteTable('emails', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull().references(() => emailThreads.id),
  from: text('from').notNull(),
  to: text('to').notNull(),
  cc: text('cc'),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  isIncoming: integer('is_incoming', { mode: 'boolean' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const emailTags = sqliteTable('email_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  emailId: text('email_id').notNull().references(() => emails.id),
  tag: text('tag').notNull(), // 'spam', 'legal', 'sales', 'support', etc.
  confidence: integer('confidence').notNull(), // 0-100
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});