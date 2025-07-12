import type { AuthenticatedUser } from '../middleware/auth.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}