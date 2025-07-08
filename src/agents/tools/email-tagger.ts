import { tool } from '@openai/agents';
import { db } from '../../db';
import { emailTags } from '../../db/schema/emails';
import { wrapToolWithLogging } from './logging-wrapper';

interface EmailTaggerParams {
  emailId: string;
  tags: string[];
  confidence?: number;
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
          enum: ['spam', 'legal', 'sales', 'support', 'billing', 'technical', 'general']
        },
        description: 'Categories to tag the email with' 
      },
      confidence: { 
        type: 'number', 
        description: 'Confidence level for the tagging (0-100)',
        default: 80,
        minimum: 0,
        maximum: 100
      }
    },
    required: ['emailId', 'tags', 'confidence'],
    additionalProperties: false
  },
  execute: wrapToolWithLogging(
    'tag_email',
    async (input: unknown) => {
      const { emailId, tags, confidence = 80 } = input as EmailTaggerParams;
      try {
        const insertedTags = await db.insert(emailTags).values(
          tags.map((tag: string) => ({
            emailId,
            tag,
            confidence,
          }))
        ).returning();

        return {
          success: true,
          emailId,
          tags: insertedTags.map(t => ({
            tag: t.tag,
            confidence: t.confidence,
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to tag email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
    (params: EmailTaggerParams) => `Tagged email ${params.emailId} as ${params.tags.join(', ')}`
  ),
});