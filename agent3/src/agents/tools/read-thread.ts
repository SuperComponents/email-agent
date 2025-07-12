import { tool } from '@openai/agents';
import { z } from 'zod';
import type { RunContext } from '@openai/agents';
import type { EmailMessage } from '../../db/types.js';

interface EmailContext {
  emails: EmailMessage[];
}

const ReadThreadParamsSchema = z.object({});

type ReadThreadParams = z.infer<typeof ReadThreadParamsSchema>;

export const readThreadTool = tool({
  name: 'read_thread',
  description: 'Read the full email thread context. This returns all emails in the current thread.',
  parameters: ReadThreadParamsSchema,
  execute: (_args: ReadThreadParams, runContext?: RunContext<EmailContext>) => {
    if (!runContext?.context) {
      return {
        success: false,
        message: 'No context available',
      };
    }

    return {
      success: true,
      ...runContext.context,
    };
  },
});
