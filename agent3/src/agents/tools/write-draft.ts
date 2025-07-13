import { tool } from '@openai/agents';
import { z } from 'zod';
import { saveDraftResponse } from '../../db/query.js';
import type { KnowledgeBaseResult } from '../guards.js';

const WriteDraftParamsSchema = z.object({
  emailId: z.number().describe('ID of the email being responded to'),
  threadId: z.number().describe('ID of the thread this draft belongs to'),
  messageBody: z.string().describe('The body text of the draft email response'),
  citationFilename: z
    .string()
    .nullable()
    .optional()
    .describe('Filename of the knowledge base source if file search results were used'),
  citationScore: z
    .number()
    .nullable()
    .optional()
    .describe('Relevance score of the knowledge base source if file search results were used'),
  citationText: z
    .string()
    .nullable()
    .optional()
    .describe('Text excerpt from the knowledge base source if file search results were used'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .default(0.85)
    .describe('Confidence score for this draft (0-1)'),
});

type WriteDraftParams = z.infer<typeof WriteDraftParamsSchema>;

export const writeDraftTool = tool({
  name: 'write_draft',
  description:
    'Create a draft email response. IMPORTANT: If you used file search results to construct the draft, you MUST include the highest scoring citation.' +
    '. DO NOT add citations to the draft if you did not use file search results.',
  parameters: WriteDraftParamsSchema,
  execute: async (input: WriteDraftParams) => {
    const {
      emailId,
      threadId,
      messageBody,
      citationFilename,
      citationScore,
      citationText,
      confidence,
    } = input;

    try {
      // Reconstruct citations object if citation data is provided
      // Validate filename and extract actual filename from emailsmart-knowledge-base pattern
      let processedFilename: string | null = null;

      if (citationFilename && citationFilename.includes('emailsmart-knowledge-base')) {
        const parts = citationFilename.split('/');
        // Find the part after 'emailsmart-knowledge-base-*/'
        const knowledgeBaseIndex = parts.findIndex(part =>
          part.startsWith('emailsmart-knowledge-base'),
        );
        if (knowledgeBaseIndex !== -1 && knowledgeBaseIndex < parts.length - 1) {
          // Get everything after the emailsmart-knowledge-base-* part
          processedFilename = parts.slice(knowledgeBaseIndex + 1).join('/');
        }
      }

      // Only create citations if we have a valid processed filename
      const citations: KnowledgeBaseResult | null =
        processedFilename &&
        processedFilename.length >= 4 &&
        citationScore !== undefined &&
        citationScore !== null &&
        citationText
          ? {
              attributes: {},
              file_id: '',
              filename: processedFilename,
              score: citationScore,
              text: citationText,
            }
          : null;

      const draft = await saveDraftResponse({
        email_id: emailId,
        thread_id: threadId,
        generated_content: messageBody,
        confidence_score: confidence.toFixed(3),
        citations,
      });

      return {
        success: true,
        draftId: draft.id,
        message: 'Draft created successfully',
        hasContext: !!citations,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});
