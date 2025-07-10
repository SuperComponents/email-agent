#!/bin/sh
set -e

echo "Email Agent Backend Starting..."

# Wait until Postgres accepts connections
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
  sleep 2
done

echo "Running database migrations..."
node dist/src/database/migrate.js

echo "Seeding database..."
node dist/src/database/seed.js

echo "Starting server on port 3000..."
exec node dist/src/index.js 