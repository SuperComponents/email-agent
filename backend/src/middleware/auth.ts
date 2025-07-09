import * as jose from 'jose'
import type { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getCookie } from 'hono/cookie'
import { STACK_PROJECT_ID } from '../config/env.js'

// Type definition for authenticated user
export interface AuthenticatedUser {
  id: string
  payload: jose.JWTPayload
}

// Cache the JWKS to avoid repeated network calls
if (!STACK_PROJECT_ID) {
  throw new Error('STACK_PROJECT_ID environment variable is required for authentication')
}

const jwks = jose.createRemoteJWKSet(
  new URL(`https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`)
)

// Helper function to extract access token from Stack Auth cookie
function extractAccessTokenFromCookie(cookieValue: string): string | null {
  try {
    // The cookie is URL-encoded JSON array: ["refresh_token_id", "jwt_token"]
    const decoded = decodeURIComponent(cookieValue)
    const tokenArray = JSON.parse(decoded)
    
    // The JWT token is the second element in the array
    if (Array.isArray(tokenArray) && tokenArray.length >= 2) {
      return tokenArray[1] // JWT token
    }
    
    return null
  } catch (error) {
    console.error('Failed to parse stack-access cookie:', error)
    return null
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    let accessToken: string | undefined

    // Option 1: Check Authorization header (Bearer token)
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7)
    }

    // Option 2: Check Stack Auth cookie if no Authorization header
    if (!accessToken) {
      const stackAccessCookie = getCookie(c, 'stack-access')
      if (stackAccessCookie) {
        accessToken = extractAccessTokenFromCookie(stackAccessCookie) || undefined
      }
    }

    if (!accessToken) {
      throw new HTTPException(401, { message: 'Authentication required' })
    }

    // Verify the JWT
    const { payload } = await jose.jwtVerify(accessToken, jwks)
    
    // Add the authenticated user info to the context
    c.set('user', {
      id: payload.sub,
      payload: payload
    })

    
    await next()
  } catch (error) {
    console.error('Authentication error:', error)
    
    if (error instanceof HTTPException) {
      throw error
    }
    
    // Handle JWT verification errors
    if (error instanceof jose.errors.JWTClaimValidationFailed ||
        error instanceof jose.errors.JWTExpired ||
        error instanceof jose.errors.JWTInvalid ||
        error instanceof jose.errors.JWSInvalid ||
        error instanceof jose.errors.JWSSignatureVerificationFailed) {
      throw new HTTPException(401, { message: 'Invalid access token' })
    }
    
    // Handle other errors (network issues, etc.)
    throw new HTTPException(500, { message: 'Authentication service error' })
  }
}

// Optional: Create a middleware that only validates if a token is present
// but doesn't require authentication (useful for optional auth endpoints)
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  try {
    let accessToken: string | undefined

    // Check Authorization header first
    const authHeader = c.req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7)
    }

    // Check Stack Auth cookie if no Authorization header
    if (!accessToken) {
      const stackAccessCookie = getCookie(c, 'stack-access')
      if (stackAccessCookie) {
        accessToken = extractAccessTokenFromCookie(stackAccessCookie) || undefined
      }
    }

    if (accessToken) {
      const { payload } = await jose.jwtVerify(accessToken, jwks)
      c.set('user', {
        id: payload.sub,
        payload: payload
      })

    }
    
    await next()
  } catch (error) {
    console.error('Optional authentication error:', error)
    // For optional auth, we don't throw errors, just continue without user
    await next()
  }
} 