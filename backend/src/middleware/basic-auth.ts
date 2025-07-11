import { basicAuth } from 'hono/basic-auth'
import type { Context, Next } from 'hono'

// Define the users for basic authentication
// In production, these should come from environment variables
const BASIC_AUTH_USERS = [
  {
    username: process.env.BASIC_AUTH_USER_1 || 'admin',
    password: process.env.BASIC_AUTH_PASS_1 || 'admin-secret-password'
  },
  {
    username: process.env.BASIC_AUTH_USER_2 || 'agent',
    password: process.env.BASIC_AUTH_PASS_2 || 'agent-secret-password'
  }
]

// Create the basic auth middleware with custom configuration
export const basicAuthMiddleware = basicAuth({
  ...BASIC_AUTH_USERS[0],
  realm: 'ProResponse API',
  invalidUserMessage: 'Invalid credentials',
}, ...BASIC_AUTH_USERS.slice(1))

// Alternative: Create a dynamic basic auth middleware with custom verification
export const dynamicBasicAuthMiddleware = basicAuth({
  verifyUser: async (username, password, c) => {
    // You can implement custom verification logic here
    // For example, checking against a database or external service
    
    // For now, check against our predefined users
    const validUser = BASIC_AUTH_USERS.find(
      user => user.username === username && user.password === password
    )
    
    if (validUser) {
      // You can set user information in the context for later use
      c.set('basicAuthUser', { username })
      return true
    }
    
    return false
  },
  realm: 'ProResponse API',
  invalidUserMessage: { 
    error: 'Authentication failed', 
    message: 'Invalid username or password' 
  }
})

// Type definition for authenticated user
export interface BasicAuthUser {
  username: string
}
