import { tool } from '@openai/agents';
import { z } from 'zod';
import { searchEmails } from '../../db/query.js';

const GetCustomerHistoryParamsSchema = z.object({
  senderEmail: z.string().describe('Email address of the customer to get history for'),
  limit: z.number().default(20).describe('Maximum number of emails to return (default: 20)'),
});

type GetCustomerHistoryParams = z.infer<typeof GetCustomerHistoryParamsSchema>;

export const getCustomerHistoryTool = tool({
  name: 'get_customer_history',
  description: `Get all email history for a specific customer to understand their complete interaction history with the company.

This tool provides context about:
- Previous issues or requests from this customer
- Communication patterns and preferences  
- Resolution history and satisfaction levels
- Account or product history
- Previous support interactions

Use this tool AFTER reading the current thread to understand the broader customer relationship context.`,
  parameters: GetCustomerHistoryParamsSchema,
  execute: async (input: GetCustomerHistoryParams) => {
    const { senderEmail, limit = 20 } = input;
    try {
      // Get all emails from this sender (empty query string)
      const emails_result = await searchEmails(senderEmail, '', limit);

      return {
        success: true,
        emails: emails_result,
        count: emails_result.length,
        summary: `Found ${emails_result.length} emails from ${senderEmail}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get customer history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});