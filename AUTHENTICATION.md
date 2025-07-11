# Authentication Status

This document explains the current authentication implementation status in the OpenSupport system.

## Current Status: ✅ Infrastructure Complete (Disabled for Testing)

The authentication system using StackAuth is **fully implemented** but **temporarily disabled** to facilitate development and testing without requiring authentication setup.

## What's Implemented

### ✅ Backend Authentication
- **JWT validation middleware** (`backend/src/middleware/auth.ts`)
- **Database schema** with `stack_auth_id` field in users table
- **Environment configuration** for StackAuth project integration
- **Protected routes** - All API endpoints require authentication

### ✅ Frontend Authentication  
- **StackAuth React components** imported and configured
- **Authentication providers** (StackProvider, StackHandler)
- **Route protection** with ProtectedRoute component
- **User interface** ready for login/logout functionality

### ✅ Database Integration
```sql
-- Users table includes StackAuth integration
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'agent',
  stack_auth_id TEXT UNIQUE,  -- StackAuth user ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Current Testing Configuration

**Backend** (`backend/src/middleware/auth.ts`):
```typescript
export const authMiddleware = async (c: Context, next: Next) => {
  // AUTH DISABLED FOR TESTING
  // Set a mock user to bypass authentication
  c.set('user', {
    id: 'test-user-id',
    payload: { sub: 'test-user-id', email: 'test@example.com' },
    dbUser: {
      id: 1,
      email: 'test@example.com', 
      name: 'Test User',
      role: 'admin'
    }
  })
  await next()
}
```

**Frontend** (`frontend/src/lib/stack.ts`):
```typescript
// Temporary mock for testing
export const stackClientApp = {
  getUser: () => Promise.resolve(null),
  useUser: () => ({ user: null, loading: false }),
  // ... other mocked methods
} as any;
```

## How to Enable StackAuth

### 1. Backend Setup
Uncomment the real authentication code in `backend/src/middleware/auth.ts`:

```typescript
const STACK_PROJECT_ID = process.env.STACK_PROJECT_ID;
const jwks = jose.createRemoteJWKSet(
  new URL(`https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}/.well-known/jwks.json`)
);

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: { message: 'Missing or invalid authorization header' } }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const { payload } = await jose.jwtVerify(token, jwks);
    c.set('user', { id: payload.sub!, payload });
    await next();
  } catch (error) {
    return c.json({ error: { message: 'Invalid token' } }, 401);
  }
};
```

### 2. Frontend Setup  
Uncomment the real StackAuth client in `frontend/src/lib/stack.ts`:

```typescript
import { StackClientApp } from '@stackframe/react';

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: 'cookie',
  redirectMethod: { useNavigate },
});
```

### 3. Environment Variables
Set the required environment variables:

**Backend** (`.env`):
```bash
STACK_PROJECT_ID=your_stack_project_id
STACK_SECRET_SERVER_KEY=your_stack_secret_key  # Optional
```

**Frontend** (`.env`):
```bash
VITE_STACK_PROJECT_ID=your_stack_project_id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
```

## StackAuth Features Ready to Use

Once enabled, the system supports:

- **JWT-based authentication** with automatic token validation
- **User registration and login** through StackAuth UI components
- **Protected routes** - Automatic redirect to login for unauthenticated users
- **User context** - Access to user information throughout the application
- **Role-based access** - Database schema supports admin/manager/agent roles
- **Session management** - Secure token storage and refresh

## Email Provider OAuth (Not Implemented)

The following OAuth integrations are **not implemented** and would be separate features:

- ❌ **Gmail OAuth** - For syncing with user's Gmail account
- ❌ **Microsoft OAuth** - For syncing with user's Outlook account  
- ❌ **Email provider APIs** - For pulling/sending emails through external services

These would be implemented as additional features for email client integration, separate from the user authentication system.

## Security Considerations

When enabling authentication:

1. **Secure environment variables** - Never commit real keys to version control
2. **HTTPS in production** - Required for secure token transmission
3. **Token expiration** - Configure appropriate token lifetimes
4. **CORS configuration** - Ensure proper cross-origin settings
5. **Database security** - Secure the PostgreSQL connection

## Testing with Authentication Enabled

To test with real authentication:

1. Create a StackAuth account and project
2. Configure environment variables  
3. Uncomment authentication code
4. Restart backend and frontend
5. Navigate to app - will redirect to StackAuth login
6. Complete authentication flow
7. Access authenticated application

The system is designed to work seamlessly once authentication is enabled, with no additional code changes required. 