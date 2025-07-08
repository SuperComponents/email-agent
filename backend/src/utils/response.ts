import type { Context } from 'hono'

export const successResponse = (c: Context, data: any, status = 200) => {
  return c.json(data, status as any)
}

export const errorResponse = (c: Context, message: string, status = 400) => {
  return c.json({ error: { message } }, status as any)
}

export const notFoundResponse = (c: Context, resource: string) => {
  return errorResponse(c, `${resource} not found`, 404)
}