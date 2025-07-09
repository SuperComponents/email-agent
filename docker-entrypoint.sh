#!/bin/sh
set -e

echo "Email Agent Backend Starting..."

# Start the application
echo "Starting server on port 3000..."
exec node dist/index.js 