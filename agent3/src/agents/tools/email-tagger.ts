import { tool } from '@openai/agents';
import { z } from 'zod';
import { getEmailById, insertEmailTags } from '../../db/query.js';

const EmailTaggerParamsSchema = z.object({
  // toolCallMotivation: z.string().describe('Why are you making this tool call?'),
  emailId: z.string().describe('ID of the email to tag'),
  tags: z
    .array(z.enum(['spam', 'legal', 'sales', 'support', 'billing', 'technical', 'general']))
    .describe('Categories to tag the email with'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .default(0.8)
    .describe('Confidence level for the tagging (0-1)'),
});

type EmailTaggerParams = z.infer<typeof EmailTaggerParamsSchema>;

function failure(error: string) {
  return {
    success: false,
    error,
  };
}

export const emailTaggerTool = tool({
  name: 'tag_email',
  description: 'Tag/categorize an email as spam, legal, sales, support, or other categories',
  parameters: EmailTaggerParamsSchema,
  execute: async (input: EmailTaggerParams) => {
    const { emailId, tags } = input;
    const confidence = input.confidence?.toFixed(3) || '0.8';
    try {
      // Convert emailId to number (new schema uses integer IDs)
      const email_id = parseInt(emailId);
      if (isNaN(email_id)) {
        return failure(`Invalid email ID: ${emailId}`);
      }

      // Verify the email exists
      const email = await getEmailById(email_id);
      if (!email) {
        return failure(`Email not found: ${emailId}`);
      }

      // Insert tags for the email
      const tagsToInsert = tags.map(tag => ({ email_id, tag, confidence }));
      const insertedTagsEntries = await insertEmailTags(tagsToInsert);
      const insertedTags = insertedTagsEntries.map(entry => entry.tag);

      return {
        success: true,
        emailId,
        confidence,
        insertedTags,
      };
    } catch (error) {
      return failure(
        `Failed to tag email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
});
