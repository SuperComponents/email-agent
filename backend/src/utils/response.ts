import type { Context } from 'hono';

type HTTPStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500;

export const successResponse = (
  c: Context,
  data: Record<string, unknown> | unknown[],
  status: HTTPStatusCode = 200,
) => {
  if (Array.isArray(data)) {
    return c.json({ success: true, data }, status);
  }
  return c.json({ success: true, ...data }, status);
};

export const errorResponse = (c: Context, message: string, status: HTTPStatusCode = 400) => {
  return c.json({ success: false, error: message }, status);
};

export const notFoundResponse = (c: Context, resource: string) => {
  return errorResponse(c, `${resource} not found`, 404);
};
