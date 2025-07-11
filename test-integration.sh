#!/bin/bash
set -e

# Integration test script for email agent services

echo "🚀 Starting integration tests..."

# Test backend connectivity
echo "Testing backend connectivity..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null || echo "0")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend not accessible (Status: $BACKEND_STATUS)"
    echo "   Make sure to start backend with: cd backend && npm run dev"
fi

# Test frontend connectivity
echo "Testing frontend connectivity..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null || echo "0")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend not accessible (Status: $FRONTEND_STATUS)"
    echo "   Make sure to start frontend with: cd frontend && npm run dev"
fi

# Test landing page connectivity
echo "Testing landing page connectivity..."
LANDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/ 2>/dev/null || echo "0")
if [ "$LANDING_STATUS" = "200" ]; then
    echo "✅ Landing page is running"
else
    echo "❌ Landing page not accessible (Status: $LANDING_STATUS)"
    echo "   Make sure to start landing page with: cd landing-page && bun run dev"
fi

# Test database connectivity (if backend is running)
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "Testing database connectivity..."
    DB_RESPONSE=$(curl -s http://localhost:3000/db-test 2>/dev/null || echo "error")
    if echo "$DB_RESPONSE" | grep -q "success.*true"; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        echo "   Check PostgreSQL service and DATABASE_URL configuration"
    fi
fi

echo ""
echo "📋 Integration Test Summary:"
echo "Backend:     $([ "$BACKEND_STATUS" = "200" ] && echo "✅ Running" || echo "❌ Not running")"
echo "Frontend:    $([ "$FRONTEND_STATUS" = "200" ] && echo "✅ Running" || echo "❌ Not running")"
echo "Landing:     $([ "$LANDING_STATUS" = "200" ] && echo "✅ Running" || echo "❌ Not running")"

echo ""
echo "🔗 Service URLs:"
echo "Backend API:   http://localhost:3000"
echo "Frontend App:  http://localhost:5173"
echo "Landing Page:  http://localhost:5174"

echo ""
echo "🧪 To run a full test, start all services and then:"
echo "1. Visit http://localhost:5174 (landing page)"
echo "2. Click 'Sign Up' to test authentication flow"
echo "3. Complete registration and verify redirect to main app"
echo "4. Test protected routes and API integration"
