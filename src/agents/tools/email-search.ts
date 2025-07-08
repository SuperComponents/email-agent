import { tool } from '@openai/agents';
import { db } from '../../db';
import { emails, emailThreads } from '../../db/schema/emails';
import { eq, and, like, desc } from 'drizzle-orm';
import { wrapToolWithLogging } from './logging-wrapper';

interface EmailSearchParams {
  senderEmail: string;
  query?: string;
  limit?: number;
}

export const emailSearchTool = tool({
  name: 'search_emails',
  description: 'Search for emails from a specific user/sender. Returns emails with their thread context.',
  parameters: {
    type: 'object',
    properties: {
      senderEmail: { type: 'string', description: 'Email address of the sender to search for' },
      query: { type: 'string', description: 'Text to search for in email content (pass empty string if not needed)' },
      limit: { type: 'number', description: 'Maximum number of emails to return' }
    },
    required: ['senderEmail', 'query', 'limit'],
    additionalProperties: false
  },
  execute: wrapToolWithLogging(
    'search_emails',
    async (input: unknown) => {
      const { senderEmail, query, limit = 10 } = input as EmailSearchParams;
      try {
        const conditions = [eq(emails.from, senderEmail)];
        
        if (query && query.trim() !== '') {
          conditions.push(like(emails.body, `%${query}%`));
        }

        const results = await db
          .select({
            email: emails,
            thread: emailThreads,
          })
          .from(emails)
          .leftJoin(emailThreads, eq(emails.threadId, emailThreads.id))
          .where(and(...conditions))
          .orderBy(desc(emails.createdAt))
          .limit(limit);

        return {
          success: true,
          emails: results.map(r => ({
            id: r.email.id,
            threadId: r.email.threadId,
            threadSubject: r.thread?.subject,
            from: r.email.from,
            to: r.email.to,
            subject: r.email.subject,
            body: r.email.body,
            createdAt: r.email.createdAt,
          })),
          count: results.length,
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to search emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
    (params: EmailSearchParams) => `Searched for emails from ${params.senderEmail}${params.query ? ` containing "${params.query}"` : ''}`
  ),
});