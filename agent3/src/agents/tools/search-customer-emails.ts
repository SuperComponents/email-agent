import { tool } from '@openai/agents';
import { z } from 'zod';
import { searchEmails } from '../../db/query.js';

const SearchCustomerEmailsParamsSchema = z.object({
  senderEmail: z.string().describe('Email address of the customer to search within'),
  searchQuery: z
    .string()
    .describe('Specific text, keywords, or phrases to search for in email content'),
  limit: z
    .number()
    .default(10)
    .describe('Maximum number of matching emails to return (default: 10)'),
});

type SearchCustomerEmailsParams = z.infer<typeof SearchCustomerEmailsParamsSchema>;

export const searchCustomerEmailsTool = tool({
  name: 'search_customer_emails',
  description: `Search for specific content within a customer's email history. This is useful for finding:

- Previous mentions of specific products, features, or services
- Past issues or error messages that match current problems
- Previous solutions or workarounds that worked for this customer
- Billing or account-related discussions
- Technical details or specifications mentioned before
- Follow-up commitments or promises made previously

Examples of when to use this tool:
- Customer mentions a product name → search for previous interactions with that product
- Customer reports an error → search for similar error messages in their history
- Customer asks about a refund → search for "refund" or "billing" in their emails
- Customer references a previous conversation → search for keywords from that context
- Customer mentions a specific feature → search for that feature name

Use this tool when you need to find specific information rather than general context.`,
  parameters: SearchCustomerEmailsParamsSchema,
  execute: async (input: SearchCustomerEmailsParams) => {
    const { senderEmail, searchQuery, limit = 10 } = input;

    if (!searchQuery.trim()) {
      return {
        success: false,
        error:
          'Search query cannot be empty. Use get_customer_history tool for general context instead.',
      };
    }

    try {
      const emails_result = await searchEmails(senderEmail, searchQuery, limit);

      return {
        success: true,
        emails: emails_result,
        count: emails_result.length,
        searchQuery,
        summary: `Found ${emails_result.length} emails from ${senderEmail} containing "${searchQuery}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search customer emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
