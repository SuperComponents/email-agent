# Integration Testing Guide

This guide covers comprehensive testing of the email agent application with authentication integration.

## Test Environment Setup

### Prerequisites
- All services running locally
- Database connected and migrated
- Stack Auth configured
- Environment variables set

### Test URLs
- **Landing Page**: http://localhost:5174
- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Test Scenarios

### 1. Landing Page Integration

#### Test 1.1: Landing Page Loads
```bash
# Test landing page accessibility
curl -I http://localhost:5174
# Expected: 200 OK
```

#### Test 1.2: Authentication Links
1. Navigate to http://localhost:5174
2. Check "Sign In" button links to `http://localhost:5173/handler/sign-in`
3. Check "Get Started Free" button links to `http://localhost:5173/handler/sign-up`
4. Verify all CTA buttons in hero section redirect correctly
5. Check pricing section buttons redirect to signup

**Expected Results:**
- All buttons should redirect to correct authentication URLs
- No 404 errors on link clicks
- Proper URL parameters passed if needed

### 2. Authentication Flow

#### Test 2.1: Sign Up Flow
1. Click "Sign Up" from landing page
2. Fill out registration form
3. Verify email if required
4. Check redirect to main application
5. Verify user is authenticated

**Expected Results:**
- Successful registration
- JWT token stored in cookies/localStorage
- Redirect to dashboard (`/`)
- Protected routes accessible

#### Test 2.2: Sign In Flow
1. Click "Sign In" from landing page
2. Enter valid credentials
3. Check redirect to main application
4. Verify authentication state

**Expected Results:**
- Successful authentication
- User data populated
- Protected routes accessible
- API calls include auth headers

#### Test 2.3: Sign Out Flow
1. While authenticated, navigate to sign out
2. Verify token is cleared
3. Check redirect to landing page
4. Verify protected routes are inaccessible

**Expected Results:**
- Authentication state cleared
- Redirect to public routes
- API calls no longer authenticated

### 3. Frontend Application

#### Test 3.1: Protected Route Access
1. Visit http://localhost:5173 without authentication
2. Should redirect to sign-in
3. After authentication, should access dashboard

**Expected Results:**
- Unauthenticated users redirected
- Authenticated users see dashboard
- Proper loading states

#### Test 3.2: API Integration
1. Open browser dev tools (Network tab)
2. Navigate through protected routes
3. Check API calls include authentication headers
4. Verify responses are successful

**Expected Results:**
- All API calls include JWT tokens
- 200 responses for authenticated requests
- Proper error handling for failed requests

### 4. Backend API

#### Test 4.1: Health Check
```bash
# Test basic connectivity
curl http://localhost:3000/
# Expected: "ProResponse AI Backend API"
```

#### Test 4.2: Database Connection
```bash
# Test database connectivity
curl http://localhost:3000/db-test
# Expected: JSON with database stats
```

#### Test 4.3: Authentication Middleware
```bash
# Test protected route without auth
curl http://localhost:3000/api/threads
# Expected: 401 Unauthorized

# Test with valid JWT (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/threads
# Expected: 200 with threads data
```

## Automated Testing Scripts

### Test Script 1: Basic Connectivity
```bash
#!/bin/bash
# test-connectivity.sh

echo "Testing service connectivity..."

# Test backend
echo "Testing backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed (Status: $BACKEND_STATUS)"
fi

# Test frontend
echo "Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed (Status: $FRONTEND_STATUS)"
fi

# Test landing page
echo "Testing landing page..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/)
if [ "$LANDING_STATUS" = "200" ]; then
    echo "✅ Landing page is running"
else
    echo "❌ Landing page failed (Status: $LANDING_STATUS)"
fi
```

### Test Script 2: Database Connectivity
```bash
#!/bin/bash
# test-database.sh

echo "Testing database connectivity..."

DB_RESPONSE=$(curl -s http://localhost:3000/db-test)
if echo "$DB_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Database connection successful"
    echo "Database stats:"
    echo "$DB_RESPONSE" | jq '.data | to_entries[] | "\(.key): \(.value.count)"'
else
    echo "❌ Database connection failed"
    echo "$DB_RESPONSE"
fi
```

### Test Script 3: Authentication Headers
```bash
#!/bin/bash
# test-auth.sh

echo "Testing authentication..."

# Test unauthenticated request
echo "Testing unauthenticated request..."
UNAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/threads)
if [ "$UNAUTH_STATUS" = "401" ]; then
    echo "✅ Unauthenticated requests properly rejected"
else
    echo "⚠️  Unexpected status for unauthenticated request: $UNAUTH_STATUS"
fi

# Note: Testing authenticated requests requires a valid JWT token
echo "Note: For authenticated testing, obtain a JWT token from the frontend"
```

## Manual Testing Checklist

### Pre-Test Setup
- [ ] All services started
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Stack Auth project configured

### Landing Page Tests
- [ ] Landing page loads without errors
- [ ] All buttons have correct href attributes
- [ ] "Sign In" redirects to `/handler/sign-in`
- [ ] "Sign Up" redirects to `/handler/sign-up`
- [ ] Hero CTA buttons work correctly
- [ ] Pricing section buttons work correctly
- [ ] Footer links work correctly

### Authentication Tests
- [ ] Sign up form loads
- [ ] Sign up completes successfully
- [ ] User is redirected after signup
- [ ] Sign in form loads
- [ ] Sign in completes successfully
- [ ] User is redirected after signin
- [ ] Sign out works correctly
- [ ] Tokens are cleared on signout

### Frontend Application Tests
- [ ] Dashboard loads for authenticated users
- [ ] Protected routes require authentication
- [ ] API calls include authentication headers
- [ ] Thread functionality works
- [ ] Knowledge base functionality works
- [ ] Navigation works correctly

### Backend API Tests
- [ ] Health check endpoint works
- [ ] Database test endpoint works
- [ ] Authentication middleware works
- [ ] Protected routes require valid JWT
- [ ] API responses are correct format
- [ ] Error handling works properly

## Performance Testing

### Load Testing
```bash
# Test concurrent requests to backend
ab -n 100 -c 10 http://localhost:3000/

# Test frontend static assets
ab -n 100 -c 10 http://localhost:5173/

# Test landing page performance
ab -n 100 -c 10 http://localhost:5174/
```

### Database Performance
```bash
# Test database query performance
time curl -s http://localhost:3000/db-test > /dev/null
```

## Common Issues and Solutions

### 1. CORS Issues
**Problem**: Frontend can't connect to backend
**Solution**: 
- Check CORS_ORIGIN in backend .env
- Verify frontend URL is included
- Restart backend after changes

### 2. Authentication Failures
**Problem**: Authentication redirects don't work
**Solution**:
- Verify Stack Auth configuration
- Check redirect URLs match
- Ensure cookies are enabled
- Check for HTTPS/HTTP mismatches

### 3. Database Connection Issues
**Problem**: Backend can't connect to database
**Solution**:
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists
- Run migrations

### 4. Environment Variable Issues
**Problem**: Services use wrong configuration
**Solution**:
- Check .env file locations
- Verify variable names match
- Restart services after changes
- Check for typos

## Continuous Integration

### GitHub Actions Example
```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
          
      - name: Setup database
        run: |
          cd backend
          npm run db:migrate
          
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
```

This comprehensive testing guide ensures all components work together correctly and provides a foundation for ongoing quality assurance.
