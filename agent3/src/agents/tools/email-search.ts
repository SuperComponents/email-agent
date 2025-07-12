import { tool } from '@openai/agents';
import { z } from 'zod';
import { searchEmails } from '../../db/query.js';

const EmailSearchParamsSchema = z.object({
  senderEmail: z.string().describe('Email address of the sender to search for'),
  query: z
    .string()
    .describe('Text to search for in email content (pass empty string if not needed)'),
  limit: z.number().describe('Maximum number of emails to return'),
});

type EmailSearchParams = z.infer<typeof EmailSearchParamsSchema>;

export const emailSearchTool = tool({
  name: 'search_emails',
  description:
    'Search for emails from a specific user/sender. Returns emails with their thread context.',
  parameters: EmailSearchParamsSchema,
  execute: async (input: EmailSearchParams) => {
    const { senderEmail, query, limit = 10 } = input;
    try {
      const emails_result = await searchEmails(senderEmail, query, limit);

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
