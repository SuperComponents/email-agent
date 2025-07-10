import * as jose from 'jose'
import type { Context, Next } from 'hono'

// Type definition for authenticated user
export interface AuthenticatedUser {
  id: string
  payload: jose.JWTPayload
  dbUser?: {
    id: number
    email: string
    name: string
    role: 'agent' | 'manager' | 'admin'
    created_at: Date | null
    updated_at: Date | null
  }
}

// Cache the JWKS to avoid repeated network calls
// AUTH DISABLED - Commenting out STACK_PROJECT_ID check
// if (!STACK_PROJECT_ID) {
//   throw new Error('STACK_PROJECT_ID environment variable is required for authentication')
// }

// AUTH DISABLED - Commenting out JWKS initialization
// const jwks = jose.createRemoteJWKSet(
//   new URL(`https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`)
// )


export const authMiddleware = async (c: Context, next: Next) => {
  // AUTH DISABLED FOR TESTING
  // Set a mock user to bypass authentication
  c.set('user', {
    id: 'test-user-id',
    payload: {
      sub: 'test-user-id',
      email: 'test@example.com'
    },
    dbUser: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin' as const,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  
  await next()
}

// Optional: Create a middleware that only validates if a token is present
// but doesn't require authentication (useful for optional auth endpoints)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  // AUTH DISABLED FOR TESTING
  // Set a mock user to bypass authentication
  c.set('user', {
    id: 'test-user-id',
    payload: {
      sub: 'test-user-id',
      email: 'test@example.com'
    },
    dbUser: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin' as const,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  
  await next()
} 