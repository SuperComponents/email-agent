import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { eq } from 'drizzle-orm'
import { db } from '../database/db.js'
import { users } from '../database/schema.js'
import { verifyAccessToken, extractBearerToken } from '../lib/auth.js'

// Type definition for authenticated user
export interface AuthenticatedUser {
  id: string
  payload: {
    userId: number
    email: string
    role: string
    type: 'access'
  }
  dbUser?: {
    id: number
    email: string
    name: string
    role: 'agent' | 'manager' | 'admin'
    created_at: Date | null
    updated_at: Date | null
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = c.req.header('Authorization')
    const token = extractBearerToken(authHeader) || getCookie(c, 'accessToken')

    if (!token) {
      return c.json({ error: 'No token provided' }, 401)
    }

    // Verify JWT token
    const payload = await verifyAccessToken(token)
    
    // Get user from database
    const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 401)
    }

    const foundUser = user[0]

    // Set user context
    c.set('user', {
      id: foundUser.id.toString(),
      payload,
      dbUser: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role as 'agent' | 'manager' | 'admin',
        created_at: foundUser.created_at,
        updated_at: foundUser.updated_at
      }
    })
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Optional: Create a middleware that only validates if a token is present
// but doesn't require authentication (useful for optional auth endpoints)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = c.req.header('Authorization')
    const token = extractBearerToken(authHeader) || getCookie(c, 'accessToken')

    if (!token) {
      // No token provided, continue without setting user
      await next()
      return
    }

    // Verify JWT token
    const payload = await verifyAccessToken(token)
    
    // Get user from database
    const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1)
    
    if (user.length > 0) {
      const foundUser = user[0]

      // Set user context
      c.set('user', {
        id: foundUser.id.toString(),
        payload,
        dbUser: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role as 'agent' | 'manager' | 'admin',
          created_at: foundUser.created_at,
          updated_at: foundUser.updated_at
        }
      })
    }
    
    await next()
  } catch (error) {
    // Token invalid, continue without setting user
    await next()
  }
}
