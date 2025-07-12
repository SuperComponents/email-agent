import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../database/db.js'
import { users } from '../database/schema.js'
import { z } from 'zod'
import { validateRequest } from '../utils/validation.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { hashPassword, verifyPassword, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/auth.js'
import { setCookie, getCookie } from 'hono/cookie'

const app = new Hono()

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required')
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const generateTokens = async (userId: number, email: string, role: string) => {
  const accessToken = await signAccessToken({ userId, email, role })
  const refreshToken = await signRefreshToken({ userId })
  
  return { accessToken, refreshToken }
}

const setTokenCookies = (c: any, accessToken: string, refreshToken: string) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  }
  
  setCookie(c, 'accessToken', accessToken, { ...cookieOptions, maxAge: 900 }) // 15 minutes
  setCookie(c, 'refreshToken', refreshToken, { ...cookieOptions, maxAge: 604800 }) // 7 days
}

// POST /auth/signup
app.post('/signup', async (c) => {
  try {
    const body = await validateRequest(c, signupSchema)
    if (!body) {
      return errorResponse(c, 'Invalid request body', 400)
    }
    
    const { email, password, name } = body
    
    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    
    if (existingUser) {
      return c.json({
        success: false,
        error: 'User already exists',
        fields: { email: 'An account with this email already exists' }
      }, 400)
    }
    
    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password_hash: passwordHash,
        name,
        role: 'agent'
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at
      })
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(newUser.id, newUser.email, newUser.role)
    
    // Set cookies
    setTokenCookies(c, accessToken, refreshToken)
    
    return successResponse(c, {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at
      }
    }, 201)
  } catch (error) {
    console.error('Signup error:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to create account', 500)
  }
})

// POST /auth/login
app.post('/login', async (c) => {
  try {
    const body = await validateRequest(c, loginSchema)
    if (!body) {
      return errorResponse(c, 'Invalid request body', 400)
    }
    
    const { email, password } = body
    
    // Find user
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        password_hash: users.password_hash,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    
    if (!user || !user.password_hash) {
      return c.json({
        success: false,
        error: 'Invalid credentials',
        fields: { email: 'Invalid email or password' }
      }, 401)
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({
        success: false,
        error: 'Invalid credentials',
        fields: { password: 'Invalid email or password' }
      }, 401)
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, user.email, user.role)
    
    // Set cookies
    setTokenCookies(c, accessToken, refreshToken)
    
    return successResponse(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to login', 500)
  }
})

// POST /auth/logout
app.post('/logout', async (c) => {
  try {
    // Clear cookies
    setCookie(c, 'accessToken', '', { maxAge: 0 })
    setCookie(c, 'refreshToken', '', { maxAge: 0 })
    
    return successResponse(c, { message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse(c, 'Failed to logout', 500)
  }
})

// POST /auth/refresh
app.post('/refresh', async (c) => {
  try {
    const refreshToken = getCookie(c, 'refreshToken')
    
    if (!refreshToken) {
      return errorResponse(c, 'No refresh token provided', 401)
    }
    
    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken)
    const userId = payload.userId
    
    // Check if user still exists
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    if (!user) {
      return errorResponse(c, 'User not found', 401)
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id, user.email, user.role)
    
    // Set new cookies
    setTokenCookies(c, accessToken, newRefreshToken)
    
    return successResponse(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Refresh error:', error)
    return errorResponse(c, 'Failed to refresh token', 500)
  }
})

// GET /auth/me
app.get('/me', async (c) => {
  try {
    const accessToken = getCookie(c, 'accessToken')
    
    if (!accessToken) {
      return errorResponse(c, 'No access token provided', 401)
    }
    
    // Verify access token
    const payload = await verifyAccessToken(accessToken)
    const userId = payload.userId
    
    // Get user
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    if (!user) {
      return errorResponse(c, 'User not found', 401)
    }
    
    return successResponse(c, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse(c, 'Failed to get user information', 500)
  }
})

export default app
