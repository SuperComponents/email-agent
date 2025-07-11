import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);

    if (err instanceof HTTPException) {
      return c.json({ error: { message: err.message } }, err.status);
    }

    if (err instanceof Error) {
      const status = (err as Error & { status?: number }).status || 500;
      return c.json(
        { error: { message: err.message } },
        status as 200 | 400 | 401 | 403 | 404 | 500,
      );
    }

    return c.json({ error: { message: 'Internal server error' } }, 500);
  }
};
