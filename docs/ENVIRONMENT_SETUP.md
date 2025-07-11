# Environment Setup Guide

This guide covers the environment configuration needed to run the email agent application with proper authentication integration.

## Required Services

### 1. Backend API (Port 3000)
- **Location**: `backend/`
- **Environment**: `backend/.env`
- **Database**: PostgreSQL

### 2. Frontend Application (Port 5173)
- **Location**: `frontend/`
- **Environment**: `frontend/.env`
- **Authentication**: Stack Auth integration

### 3. Landing Page (Port 5174)
- **Location**: `landing-page/`
- **Environment**: `landing-page/.env`
- **Purpose**: Marketing site with auth redirects

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/email_agent

# API Configuration
PORT=3000
NODE_ENV=development

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_key_here

# CORS Origins
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3000

# Stack Auth Configuration
VITE_STACK_PROJECT_ID=your_stack_project_id
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
VITE_STACK_SECRET_KEY=your_stack_secret_key

# Application Configuration
VITE_APP_NAME=ProResponse AI
```

### Landing Page (.env)
```env
# Frontend URL for authentication redirects
BUN_PUBLIC_APP_URL=http://localhost:5173

# Application Configuration
BUN_PUBLIC_APP_NAME=OpenSupport
```

## Authentication Flow

### 1. User Journey
1. User visits landing page at `http://localhost:5174`
2. Clicks "Sign In" → redirects to `http://localhost:5173/handler/sign-in`
3. Clicks "Sign Up" → redirects to `http://localhost:5173/handler/sign-up`
4. Stack Auth handles authentication
5. After auth, user accesses protected routes in frontend

### 2. Authentication Routes
- **Sign In**: `/handler/sign-in`
- **Sign Up**: `/handler/sign-up`  
- **Sign Out**: `/handler/sign-out`
- **Profile**: `/handler/profile`

### 3. Protected Routes
- **Dashboard**: `/` (InboxPage)
- **Threads**: `/thread/:threadId`
- **Knowledge Base**: `/knowledge-base`

## Setup Instructions

### 1. Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
createdb email_agent

# Run migrations
cd backend
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Stack Auth keys
npm run dev
```

### 4. Landing Page Setup
```bash
cd landing-page
bun install
cp .env.example .env
# Edit .env with frontend URL
bun run dev
```

## Stack Auth Configuration

### 1. Create Stack Auth Project
1. Go to [stack-auth.com](https://stack-auth.com)
2. Create a new project
3. Copy the project ID and keys
4. Add to frontend `.env` file

### 2. Configure Authentication
- **Sign-in methods**: Email + password, magic links
- **Redirect URLs**: `http://localhost:5173/handler/sign-in`
- **Allowed origins**: `http://localhost:5173`, `http://localhost:5174`

## Testing the Complete Flow

### 1. Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: Landing Page
cd landing-page && bun run dev
```

### 2. Test Authentication
1. Visit `http://localhost:5174`
2. Click "Sign Up" or "Sign In"
3. Complete authentication flow
4. Verify redirect to main application
5. Test protected routes

### 3. Verify API Integration
1. Check browser network tab for API calls
2. Verify JWT tokens are included in requests
3. Test authenticated endpoints

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS_ORIGIN includes frontend URLs
   - Check browser console for specific origins

2. **Authentication Failures**
   - Verify Stack Auth keys are correct
   - Check redirect URLs match configuration
   - Ensure cookies/tokens are being set

3. **Database Connection**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Run migrations if needed

4. **Environment Variables**
   - Ensure all .env files are properly configured
   - Restart services after changing .env
   - Check for typos in variable names

### Debug Commands
```bash
# Check backend health
curl http://localhost:3000/

# Check database connection
curl http://localhost:3000/db-test

# Check frontend build
cd frontend && npm run build

# Check landing page build
cd landing-page && bun run build
```

## Production Deployment

### Environment Updates
- Update URLs to production domains
- Use production database
- Configure proper CORS origins
- Set secure cookie settings
- Enable HTTPS

### Security Considerations
- Use environment-specific secrets
- Enable rate limiting
- Configure proper CSP headers
- Set up monitoring and logging
