import { tool } from '@openai/agents';
import { db } from '../../db/db.js';
import { emails, emailTags } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

interface EmailTaggerParams {
  emailId: string;
  tags: string[];
  confidence?: number;
}

function failure(error: string) {
  return {
    success: false,
    error,
  };
}

export const emailTaggerTool = tool({
  name: 'tag_email',
  description: 'Tag/categorize an email as spam, legal, sales, support, or other categories',
  parameters: {
    type: 'object',
    properties: {
      emailId: { type: 'string', description: 'ID of the email to tag' },
      tags: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['spam', 'legal', 'sales', 'support', 'billing', 'technical', 'general'],
        },
        description: 'Categories to tag the email with',
      },
      confidence: {
        type: 'number',
        description: 'Confidence level for the tagging (0-100)',
        default: 80,
        minimum: 0,
        maximum: 100,
      },
    },
    required: ['emailId', 'tags', 'confidence'],
    additionalProperties: false,
  },
  execute: async (input: unknown) => {
    const { emailId, tags, confidence = 80 } = input as EmailTaggerParams;
    try {
      // Convert emailId to number (new schema uses integer IDs)
      const email_id = parseInt(emailId);
      if (isNaN(email_id)) {
        return failure(`Invalid email ID: ${emailId}`);
      }

      // Verify the email exists
      const email = await db.select().from(emails).where(eq(emails.id, email_id)).limit(1);
      if (email.length === 0) {
        return failure(`Email not found: ${emailId}`);
      }

      // Insert tags for the email
      const tagsToInsert = tags.map(tag => ({
        email_id,
        tag,
        confidence: (confidence / 100).toFixed(3), // Convert to decimal (0-1)
      }));

      const insertedTags = await db.insert(emailTags).values(tagsToInsert).returning();

      return {
        success: true,
        emailId,
        tags: insertedTags.map(t => ({
          tag: t.tag,
          confidence: parseFloat(t.confidence || '0') * 100, // Convert back to percentage
        })),
      };
    } catch (error) {
      return failure(
        `Failed to tag email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
});
