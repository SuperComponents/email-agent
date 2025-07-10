import { tool } from '@openai/agents';
import { db } from '../../db/db';
import { emails, threads } from '../../db/newschema';
import { eq, and, like, desc } from 'drizzle-orm';
import { EmailMessage } from '../email-agent';

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
  execute: async (input: unknown) => {
    const { senderEmail, query, limit = 10 } = input as EmailSearchParams;
    try {
      const conditions = [eq(emails.from_email, senderEmail)];
      
      if (query && query.trim() !== '') {
        conditions.push(like(emails.body_text, `%${query}%`));
      }

      const emails_result = await db.query.emails.findMany({
        where: and(...conditions),
        orderBy: [desc(emails.created_at)],
        limit,
      }) as EmailMessage[]

      return {
        success: true,
        emails: emails_result,
        count: emails_result.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});