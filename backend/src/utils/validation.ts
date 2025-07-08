import type { Context } from 'hono'
import { z } from 'zod'

export const threadFilterSchema = z.enum([
  'all',
  'unread',
  'flagged',
  'urgent',
  'awaiting_customer',
  'closed'
]).optional()

export const threadStatusSchema = z.enum(['active', 'closed', 'needs_attention'])

export const updateThreadSchema = z.object({
  status: threadStatusSchema.optional(),
  tags: z.array(z.string()).optional()
})

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty')
})

export const updateDraftSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty')
})

export const regenerateDraftSchema = z.object({
  instructions: z.string().optional()
})

export const validateRequest = async <T>(
  c: Context,
  schema: z.ZodSchema<T>
): Promise<T | null> => {
  try {
    const body = await c.req.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      c.status(400)
      throw new Error(message)
    }
    throw error
  }
}