import type { AuthenticatedUser } from './middleware/auth.js';

declare global {
  namespace Hono {
    interface ContextVariableMap {
      user: AuthenticatedUser;
    }
  }
}

export {};